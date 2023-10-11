// // this program implements delete and soft delete API for Employee bank info

// const {
//   DynamoDBClient, // create instance dynamoDB
//   UpdateItemCommand, // for updating data
// } = require('@aws-sdk/client-dynamodb');
// const { marshall } = require('@aws-sdk/util-dynamodb'); // retrive and store data

// // create constant client which is instance of dynamoDB use for sendig update data to the DB
// const client = new DynamoDBClient();

// // function delete EmployeeBankInfo to delete bank information of the employee
// const handleDeleteEmployeeBankInfo = async (event) => {
//   // defined const response and store the status code of 200
//   const response = { statusCode: 200 };
//   // try block will examine employeeId in DB and if found it will delete otherwise it will throw error
//   try {
//     const { employeeId } = event.pathParameters;

//     // Create an empty DynamoDB List attribute after delete perform
//     const emptyList = { L: [] };

//     // created const params and refered in program to proccess employeeId update
//     const params = {
//       // Table name
//       TableName: process.env.DYNAMODB_TABLE_NAME,
//       Key: marshall({ employeeId }),
//       UpdateExpression: 'SET bankInfoDetails = :emptyList',
//       ExpressionAttributeValues: {
//         ':emptyList': emptyList, //
//       },
//     };

//     // Use the update method with UpdateExpression to set bankInfoDetails to an empty list
//     const updateResult = await client.send(new UpdateItemCommand(params));

//     // convert raw data response from server to JSON string format
//     response.body = JSON.stringify({
//       message: `Successfully deleted employeeId bank Details.`,
//       updateResult,
//     });
//   } catch (e) {
//     console.error(e);
//     response.statusCode = 500;
//     // convert raw data response from server to JSON string format
//     response.body = JSON.stringify({
//       message: `Failed to delete employeeId bank Details.`,
//       errorMsg: e.message,
//       errorStack: e.stack,
//     });
//   }
//   // returns the response 200
//   return response;
// };

// const softDeleteEmployeeBankInfo = async (event) => {
//   // set 200 response
//   const response = { statusCode: 200 };
//   try {
//     const { employeeId } = event.pathParameters;
//     // writing params
//     const params = {
//       // table name
//       TableName: process.env.DYNAMODB_TABLE_NAME,
//       // passing marshalled employeeId value
//       Key: marshall({ employeeId }),
//       // update expression for isActive property which present in bankInfoDetails
//       UpdateExpression: 'SET bankInfoDetails[0].isActive = :isActive',
//       ExpressionAttributeValues: {
//         // Set to true to update "isActive" to true
//         ':isActive': { BOOL: true },
//       },
//     };

//     // sending params to dynamoDb
//     const updateResult = await client.send(new UpdateItemCommand(params));

//     // response body values
//     response.body = JSON.stringify({
//       message: `Successfully soft deleted employeeId bank Details.`,
//       updateResult,
//     });
//   } catch (e) {
//     // error handling block for 500 error satus
//     console.error(e);
//     response.statusCode = 500;
//     response.body = JSON.stringify({
//       message: `Failed to soft delete employeeId bank Details.`,
//       errorMsg: e.message,
//       errorStack: e.stack,
//     });
//   }
//   // returns the response
//   return response;
// };

// module.exports = {
//   handleDeleteEmployeeBankInfo,
//   softDeleteEmployeeBankInfo
// };

// Importing necessary modules from the AWS SDK for DynamoDB
const {
  DynamoDBClient,
  UpdateItemCommand,
} = require('@aws-sdk/client-dynamodb');

// Importing the marshall function from the utility library for DynamoDB
const { marshall } = require('@aws-sdk/util-dynamodb');

// Creating an instance of DynamoDBClient
const client = new DynamoDBClient();

const handleDeleteOperation = async (event) => {
  const response = { statusCode: 200 };
    const employeeId  = event.pathParameters.employeeId ;
  try {
    const employeeId = event.pathParameters.employeeId;
    const endpoint = event.path;

    // Create an empty DynamoDB List attribute after delete perform
    const emptyList = { L: [] };

    switch (endpoint) {
      case `/employee/${employeeId}`:
        // Handle DELETE operation

        const deleteParams = {
          TableName: process.env.DYNAMODB_TABLE_NAME,
          Key: marshall({ employeeId: employeeId }),
          UpdateExpression: 'SET bankInfoDetails = :emptyList',
          ExpressionAttributeValues: {
            ':emptyList': emptyList, 
          },
          ConditionExpression: 'attribute_exists(employeeId )',
        };

        const deleteResult = await client.send(
          new UpdateItemCommand(deleteParams)
        );

        response.body = JSON.stringify({
          message: 'Successfully deleted employee.',
          deleteResult,
        });
        break;

      case `/employee/${employeeId}/softDelete`:
        // Handle PATCH operation (Soft Delete)
        const updateExpression = 'SET bankInfoDetails[0].isActive = :isActive';
        const expressionAttributeValues = marshall({
          ':isActive': true,
        });
        const updateParams = {
          TableName: process.env.DYNAMODB_TABLE_NAME,
          Key: marshall({ employeeId }),
          UpdateExpression: updateExpression,
          ExpressionAttributeValues: expressionAttributeValues,
          ConditionExpression: 'attribute_exists(employeeId )',
        };
        const updateResult = await client.send(
          new UpdateItemCommand(updateParams)
        );

        response.body = JSON.stringify({
          message: 'Employee deleted successfully.',
          updateResult,
        });
        break;

      default:
        response.statusCode = 400; // Bad Request
        response.body = JSON.stringify({
          message: 'Invalid endpoint.',
        });
    }
  } catch (e) {
    console.error(e);
    response.statusCode = e.statusCode || 500;
    const metadata = e.$metadata || {};
    response.body = JSON.stringify({
      statusCode: metadata.httpStatusCode || response.statusCode,
      message: `Failed to process${employeeId } employee operation.`,
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }

  return response;
};

module.exports = {
  handleDeleteOperation,
};