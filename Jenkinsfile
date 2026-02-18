pipeline {
    agent {
        kubernetes {
            yaml """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: node
    image: node:18-alpine
    command:
    - cat
    tty: true
    volumeMounts:
    - name: docker-sock
      mountPath: /var/run/docker.sock
  - name: playwright
    image: mcr.microsoft.com/playwright:v1.45.0-focal
    command:
    - cat
    tty: true
  volumes:
  - name: docker-sock
    hostPath:
      path: /var/run/docker.sock
            """
        }
    }

    environment {
        // Default environment settings
        TLD = "${params.TLD ?: 'staging.env.mpb.com'}"
        PROTOCOL = "${params.PROTOCOL ?: 'https'}"
        HEADLESS = 'true'
        CI = 'true'
        WORKERS = '2'  // Reduced for CI stability
        VISUAL_THRESHOLD = "${params.VISUAL_THRESHOLD ?: '0.1'}"
    }

    parameters {
        choice(
            name: 'TLD',
            choices: [
                'staging.env.mpb.com',
            ],
            description: 'Target environment'
        )
        choice(
            name: 'TEST_SUITE',
            choices: [
                'all',
                'swan',
                'toucan',
                'flamingo',
                'goose',
                'mobile-only'
            ],
            description: 'Test suite to run'
        )
        string(
            name: 'VISUAL_THRESHOLD',
            defaultValue: '0.1',
            description: 'Visual comparison threshold (0.0-1.0)'
        )
        booleanParam(
            name: 'UPDATE_BASELINES',
            defaultValue: false,
            description: 'Update visual baselines'
        )
        booleanParam(
            name: 'MOBILE_VIEW',
            defaultValue: false,
            description: 'Run mobile viewport tests'
        )
    }

    stages {
        stage('Setup') {
            steps {
                container('node') {
                    script {
                        // Install dependencies
                        sh 'npm ci'
                        echo "Environment: ${env.TLD}"
                        echo "Test Suite: ${params.TEST_SUITE}"
                        echo "Mobile View: ${params.MOBILE_VIEW}"
                    }
                }
            }
        }

        stage('Install Browsers') {
            steps {
                container('playwright') {
                    script {
                        sh 'npx playwright install --with-deps chromium'
                    }
                }
            }
        }

        stage('Visual Regression Tests') {
            parallel {
                stage('Desktop Tests') {
                    when {
                        not {
                            expression { params.MOBILE_VIEW == true }
                        }
                    }
                    steps {
                        container('playwright') {
                            script {
                                def testCommand = getTestCommand(params.TEST_SUITE, false, params.UPDATE_BASELINES)
                                sh testCommand
                            }
                        }
                    }
                }

                stage('Mobile Tests') {
                    when {
                        anyOf {
                            expression { params.MOBILE_VIEW == true }
                            expression { params.TEST_SUITE == 'mobile-only' }
                        }
                    }
                    steps {
                        container('playwright') {
                            script {
                                def testCommand = getTestCommand(params.TEST_SUITE, true, params.UPDATE_BASELINES)
                                sh testCommand
                            }
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            // Publish test results
            publishTestResults testResultsPattern: 'test-results/junit.xml'

            // Archive test reports
            archiveArtifacts artifacts: 'playwright-report/**', allowEmptyArchive: true
            archiveArtifacts artifacts: 'test-results/**', allowEmptyArchive: true

            // Publish HTML report
            publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Visual Regression Report'
            ])
        }

        failure {
            // Notify on failures
            emailext (
                subject: "Visual Regression Tests Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: """
Visual regression tests failed for ${env.TLD}

Build: ${env.BUILD_URL}
Report: ${env.BUILD_URL}Visual_Regression_Report/

Test Suite: ${params.TEST_SUITE}
Environment: ${env.TLD}
                """,
                to: "${env.CHANGE_AUTHOR_EMAIL ?: 'team@mpb.com'}"
            )
        }

        success {
            script {
                if (params.UPDATE_BASELINES) {
                    echo "Visual baselines updated successfully"
                }
            }
        }
    }
}

def getTestCommand(testSuite, mobile, updateBaselines) {
    def baseCommand = 'npx playwright test'
    def options = []

    // Add mobile flag
    if (mobile) {
        options.add('--project="Mobile Chrome"')
    } else {
        options.add('--project="Desktop Chrome"')
    }

    // Add update snapshots flag
    if (updateBaselines) {
        options.add('--update-snapshots')
    }

    // Add test directory based on suite
    def testPath = ''
    switch(testSuite) {
        case 'swan':
            testPath = 'tests/swan'
            break
        case 'toucan':
            testPath = 'tests/toucan'
            break
        case 'flamingo':
            testPath = 'tests/flamingo'
            break
        case 'goose':
            testPath = 'tests/goose'
            break
        case 'mobile-only':
            testPath = 'tests'
            break
        case 'all':
        default:
            testPath = 'tests'
            break
    }

    return "${baseCommand} ${testPath} ${options.join(' ')}"
}