const {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  DeleteItemCommand,
  ScanCommand,
  UpdateItemCommand,
} = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

const client = new DynamoDBClient();

const getUserDetail = async (event) => {
  const response = { statusCode: 200 };
  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ UserDetailId: event.pathParameters.UserDetailId }),
    };
    const { Item } = await client.send(new GetItemCommand(params));
    response.body = JSON.stringify({
      message: 'Successfully retrieved UserDetail.',
      data: Item ? unmarshall(Item) : {},
      rawData: Item,
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: 'Failed to get UserDetail.',
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }
  return response;
};

const createUserDetail = async (event) => {
  const response = { statusCode: 200 };
  try {
    const requestJSON = JSON.parse(event.body);
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      // Item: marshall(body || {}),
      Item: marshall({
        UserDetailId: requestJSON.UserDetailId,
        jobTitle: requestJSON.jobTitle,
        firstName: requestJSON.firstName,
        lastName: requestJSON.lastName,
        eamil: requestJSON.eamil,
        phoneNumber: requestJSON.phoneNumber,
        userId: requestJSON.userId,
        address: requestJSON.address,
        gender: requestJSON.gender,
        password: requestJSON.password,
        confirmPassword: requestJSON.confirmPassword,
      }),
    };
    const createResult = await client.send(new PutItemCommand(params));
    response.body = JSON.stringify({
      message: 'Successfully created UserDetail.',
      createResult,
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: 'Failed to create UserDetail.',
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }
  return response;
};

const updateUserDetail = async (event) => {
  console.log('event', event);
  const response = { statusCode: 200 };
  try {
    const body = JSON.parse(event.body);
    const objKeys = Object.keys(body);
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ UserDetailId: event.pathParameters.UserDetailId }),
      UpdateExpression: `SET ${objKeys
        .map((_, index) => `#key${index} = :value${index}`)
        .join(', ')}`,
      ExpressionAttributeNames: objKeys.reduce(
        (acc, key, index) => ({
          ...acc,
          [`#key${index}`]: key,
        }),
        {}
      ),
      ExpressionAttributeValues: marshall(
        objKeys.reduce(
          (acc, key, index) => ({
            ...acc,
            [`:value${index}`]: body[key],
          }),
          {}
        )
      ),
    };
    const updateResult = await client.send(new UpdateItemCommand(params));
    response.body = JSON.stringify({
      message: 'Successfully updated UserDetail.',
      updateResult,
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: 'Failed to update UserDetail.',
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }
  return response;
};

const deleteUserDetail = async (event) => {
  const response = { statusCode: 200 };
  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ UserDetailId: event.pathParameters.UserDetailId }),
    };
    const deleteResult = await client.send(new DeleteItemCommand(params));
    response.body = JSON.stringify({
      message: 'Successfully deleted UserDetail.',
      deleteResult,
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: 'Failed to delete UserDetail.',
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }
  return response;
};

const getAllUserDetails = async () => {
  const response = { statusCode: 200 };
  try {
    const { Items } = await client.send(
      new ScanCommand({ TableName: process.env.DYNAMODB_TABLE_NAME })
    );
    response.body = JSON.stringify({
      message: 'Successfully retrieved all UserDetails.',
      data: Items.map((item) => unmarshall(item)),
      Items,
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: 'Failed to retrieve UserDetails.',
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }
  return response;
};

module.exports = {
  getUserDetail,
  createUserDetail,
  updateUserDetail,
  deleteUserDetail,
  getAllUserDetails,
};
