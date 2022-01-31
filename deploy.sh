set -e

VERSION=$1
if [[ -z $VERSION ]]; then
    echo "usage: $0 <version>"
    exit 1
fi

git clone git@github.com:tjbrockmeyer/linkbot-x /tmp/linkbot
cd /tmp/linkbot
if ! git checkout "tags/$VERSION"; then
    echo "could not check out a tag with the version $VERSION"
    exit 1
fi

echo 'Building image...'
docker build -t linkbot .
echo 'Sending image to lightsail instance...'
docker save linkbot | bzip2 | lightsail-ssh.sh LS1 'docker load'

echo 'Getting application credentials...'
aws ssm get-parameter --with-decryption --name=' /linkbot/access-key' --output text --query 'Parameter.Value' > /tmp/creds
lightsail-scp.sh LS1 /tmp/creds ' /tmp/linkbot-creds'
rm -rf /tmp/creds

echo 'Deploying application...'
lightsail-ssh.sh LS1 \
"docker stop \$(cat ~/linkbot) &>/dev/null;
docker rm \$(cat ~/linkbot) &>/dev/null;
mv /tmp/linkbot-creds ~/linkbot-access-key;

docker run -d \
    -e APP_NAME=linkbot \
    -e ENV=prod \
    -e TIMEZONE_OFFSET=-6 \
    -e NODE_ENV=production \
    -e AWS_ACCESS_KEY_ID=\$(jq -r .id < ~/linkbot-access-key) \
    -e AWS_SECRET_ACCESS_KEY=\$(jq -r .secret < ~/linkbot-access-key) \
    -e AWS_REGION=us-east-1 \
    linkbot > ~/linkbot;
rm -rf ~/linkbot-access-key;"


# export AWS_ACCESS_KEY_ID=\$(jq -r .id < ~/linkbot-access-key);
# export AWS_SECRET_ACCESS_KEY=\$(jq -r .secret < ~/linkbot-access-key);
    # --log-driver=awslogs \
    # --log-opt awslogs-region=us-east-1 \
    # --log-opt awslogs-group=/app/linkbot \

echo 'Done.'
