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
// };

const {
  DynamoDBClient,
  UpdateItemCommand,
  DeleteItemCommand,
} = require('@aws-sdk/client-dynamodb');
const { marshall } = require('@aws-sdk/util-dynamodb');

const client = new DynamoDBClient();

const handleEmployeeBankInfo = async (event) => {
  const response = { statusCode: 200 };

  try {
    const { employeeId } = event.pathParameters;
    let operation;

    console.log('URL Path ', event.path);

  if (event.path.includes('/softDelete')) {
    operation = 'softDelete';
  } else if (event.path.includes('/delete')) {
    operation = 'delete';
  } else {
    console.log('Invalid Path:', event.path);
    throw new Error('Invalid operation');
  }

  console.log('Operation ', operation);

  const params = {
    TableName: process.env.DYNAMODB_TABLE_NAME,
    Key: marshall({ employeeId }),
  };
  console.log('params ', params);

  switch (operation) {
    case 'softDelete':
      params.UpdateExpression = 'SET bankInfoDetails[0].isActive = :isActive';
      params.ExpressionAttributeValues = { ':isActive': { BOOL: true } };
      break;
    case 'delete':
      params.DeleteExpression = 'bankInfoDetails';
      break;
    default:
      throw new Error('Invalid operation');
  }


    const updateResult = await client.send(
      operation === 'softDelete'
        ? new UpdateItemCommand(params)
        : new DeleteItemCommand(params)
    );

    response.body = JSON.stringify({
      message: `Successfully ${
        operation === 'softDelete' ? 'soft ' : ''
      }deleted employeeId bank Details.`,
      updateResult,
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: `Failed to ${
        operation === 'softDelete' ? 'soft ' : ''
      }delete employeeId bank Details.`,
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }

  return response;
};

module.exports = {
  handleEmployeeBankInfo,
};
