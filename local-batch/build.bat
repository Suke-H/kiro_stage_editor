docker build -t kiro-stage-editor .
docker run --name kiro-stage-editor -d -p 8080:8080 kiro-stage-editor