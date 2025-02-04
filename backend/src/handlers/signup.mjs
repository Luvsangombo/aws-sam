import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const region = "us-east-1";

const s3 = new S3Client({ region: region });
const dynamoDB = new DynamoDBClient({ region: region});
const DYNAMODB_TABLE_NAME = "users";
const S3_BUCKET_NAME = "profile-userimages";

export const handler = async (event) => {
  try {
    const { filename, contentType, username, password } = JSON.parse(event.body);
    console.log(filename, contentType, username, password);
    const password_encrypted = btoa(password);
    const uploadParams = {
      Bucket: S3_BUCKET_NAME,
      Key: filename,
      ContentType: contentType,

    };
    const command = new PutObjectCommand(uploadParams);
    const uploadURL = await getSignedUrl(s3, command, { expiresIn: 60 });
    const timestamp = new Date().toISOString();
    const item = {
      username: { S: username },
      password: { S: password_encrypted },
      imageUrl: { S: `https://${S3_BUCKET_NAME}.s3.${region}.amazonaws.com/${filename}` },
      datetime: { S: timestamp },
    };
    console.log("IMAGE URL ", item.imageUrl)
    await dynamoDB.send(new PutItemCommand({
      TableName: DYNAMODB_TABLE_NAME,
      Item: item,
    }));

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ uploadURL }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
};