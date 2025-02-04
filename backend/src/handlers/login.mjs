import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

const dynamoDB = new DynamoDBClient({ region: "us-east-1" });
const DYNAMODB_TABLE_NAME = "users";

export const handler = async (event) => {
  try {
    const { username, password } = JSON.parse(event.body);
    const password_decrypted = btoa(password)
    console.log("DECRTPS",password_decrypted);
    const input = {
      "Key": {
            "username" : {
                "S": username
            }
          },
      "TableName": DYNAMODB_TABLE_NAME

    }

    const response  =  await dynamoDB.send(new GetItemCommand(input));

    const user = response.Item;
    if(user.password.S === password_decrypted)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },


      body: JSON.stringify({image: user.imageUrl.S, datetime: user.datetime.S, username: user.username.S}),
    };
    else
        return {
            statusCode: 403,
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST',
              'Access-Control-Allow-Headers': 'Content-Type',
            },
            body: JSON.stringify({ message: "invalid username password" }),
          }


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