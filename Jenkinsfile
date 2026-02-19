pipeline {
    agent {
        kubernetes {
            yaml """
apiVersion: v1
kind: Pod
spec:
  containers:
  # Commented out Node container - using only Playwright
  # - name: node
  #   image: node:18-alpine
  #   command:
  #   - cat
  #   tty: true
  #   volumeMounts:
  #   - name: docker-sock
  #     mountPath: /var/run/docker.sock
  - name: playwright
    image: mcr.microsoft.com/playwright:v1.48.0-jammy
    command:
    - cat
    tty: true
    resources:
      requests:
        memory: "2Gi"
        cpu: "1"
      limits:
        memory: "4Gi"
        cpu: "2"
  # Commented out Docker volumes - not needed for Chrome-only setup
  # volumes:
  # - name: docker-sock
  #   hostPath:
  #     path: /var/run/docker.sock
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
        string(
            name: 'TLD',
            defaultValue: 'staging.env.mpb.com',
            description: 'Target environment (e.g., staging.env.mpb.com, feature.env.mpb.com, swan.koda-500.env.mpb.com)'
        )
        choice(
            name: 'TEST_SUITE',
            choices: [
                'All',
                'Swan',
                'Toucan',
                'Flamingo',
                'Goose',
                'Mobile-only'
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
                container('playwright') {
                    script {
                        // Install dependencies and Chrome browser
                        sh '''
                            npm ci
                            npx playwright install --with-deps chromium
                        '''
                        echo "Environment: ${env.TLD}"
                        echo "Test Suite: ${params.TEST_SUITE}"
                        echo "Mobile View: ${params.MOBILE_VIEW}"
                    }
                }
            }
        }

        // Commented out separate browser install stage - now combined with setup
        /*
        stage('Install Browsers') {
            steps {
                container('playwright') {
                    script {
                        sh 'npx playwright install --with-deps chromium'
                    }
                }
            }
        }
        */

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
            script {
                // Archive all test results for user access
                archiveArtifacts artifacts: 'playwright-report/**/*', allowEmptyArchive: true
                archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
                archiveArtifacts artifacts: 'allure-results/**/*', allowEmptyArchive: true

                // Publish HTML report for easy viewing
                if (fileExists('playwright-report/index.html')) {
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'Visual Test Report'
                    ])
                }

                // Publish JUnit results if available (no emails, just for Jenkins UI)
                if (fileExists('test-results/junit.xml')) {
                    junit allowEmptyResults: true, testResultsPattern: 'test-results/junit.xml'
                }

                echo "📊 Test results archived and available in build artifacts"
                echo "📁 Access reports via: ${env.BUILD_URL}artifact/"
            }
        }

        failure {
            echo "❌ Visual regression tests failed. Check the archived reports for details."
        }

        success {
            script {
                echo "✅ Visual regression tests completed successfully!"
                if (params.UPDATE_BASELINES) {
                    echo "📸 Visual baselines updated successfully"
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
        case 'Swan':
            testPath = 'tests/swan'
            break
        case 'Toucan':
            testPath = 'tests/toucan'
            break
        case 'Flamingo':
            testPath = 'tests/flamingo'
            break
        case 'Goose':
            testPath = 'tests/goose'
            break
        case 'Mobile-only':
            testPath = 'tests'
            break
        case 'All':
        default:
            testPath = 'tests'
            break
    }

    return "${baseCommand} ${testPath} ${options.join(' ')}"
}