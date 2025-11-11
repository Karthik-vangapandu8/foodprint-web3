const AWS = require('aws-sdk');

// Digital Ocean imports
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Digital Ocean config. // Set S3 endpoint to DigitalOcean Spaces
const bucketEndpoint = process.env.DO_ENDPOINT;
const bucketKey = process.env.DO_KEY_ID;
const bucketSecret = process.env.DO_SECRET;

const BucketName = process.env.DO_BUCKET_NAME;

// Check if DigitalOcean is configured
const isDigitalOceanConfigured = !!(BucketName && bucketEndpoint && bucketKey && bucketSecret);

let uploadConnection = null;

if (isDigitalOceanConfigured) {
  const config = {
    //Get the endpoint from the DO website for your space
    endpoint: bucketEndpoint,
    useAccelerateEndpoint: false,
    //Create a credential using DO Spaces API key (https://cloud.digitalocean.com/account/api/tokens)
    credentials: new AWS.Credentials(bucketKey, bucketSecret, null),
  };
  uploadConnection = new AWS.S3(config);
  console.log('✅ DigitalOcean Spaces configured for file uploads');
} else {
  console.log('⚠️  DigitalOcean Spaces not configured - file uploads will be skipped (OK for local testing)');
}

const getUploadParams = function (bucket, contentType, buffer_data, acl, filename) {
  //returns uploadParams dict
  return (uploadParameters = {
    Bucket: bucket,
    ContentType: contentType,
    Body: buffer_data,
    ACL: acl, //set file to public access
    Key: filename,
  });
};

const resolveFilenames = function (filename, extension) {
  // force filename to lower case so that string matching in chatbot is not an issue
  filename = filename.toLowerCase();
  if (isDigitalOceanConfigured) {
    const fullUrl = 'https://' + BucketName + '.' + bucketEndpoint + '/' + filename + extension;
    return (result = {
      filename: filename + extension,
      fileUrl: fullUrl,
    });
  } else {
    // Return placeholder URL for local testing
    return (result = {
      filename: filename + extension,
      fileUrl: '/uploads/' + filename + extension,
    });
  }
};

/*
const getCheckFileParams = (Bucket, key) => {
  return (checkFileParams = {
    Bucket: Bucket,
    Key: key,
  });
};

const checkFileExists = async function () {
  // DO Check if file exists by returning metadata
 
  const input = {
    Bucket: BucketName,
    Key: 'foodprint_produceprice_2022-07-26.pdf',
  };
  const client = new S3Client(config);
  const command = new AWS.HeadObjectCommand(input);
  const response = await client.send(command);
  console.log(response);
};
*/

module.exports = { 
  uploadConnection, 
  getUploadParams, 
  resolveFilenames,
  isDigitalOceanConfigured 
};
