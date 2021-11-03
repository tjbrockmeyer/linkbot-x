cd /tmp/
git clone https://github.com/tjbrockmeyer/linkbot-x.git
cd linkbot-x
docker build -t linkbot .
if [[ -e ~/linkbot ]]; then
    docker stop $(cat ~/linkbot)
    docker rm $(cat ~/linkbot)
fi
docker run -d \
  -e APP_NAME=linkbot \
  -e ENV=prod \
  -e ROLE_ARN=arn:aws:iam::060868188835:role/linkbot-role \
  -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
  -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
  -e AWS_REGION=$AWS_REGION \
  linkbot > ~/linkbot
