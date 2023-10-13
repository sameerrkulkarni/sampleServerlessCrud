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
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');

// Creating an instance of DynamoDBClient
const client = new DynamoDBClient();

const handleDeleteOperation = async (event) => {
  const response = { statusCode: 200 };
  const employeeId = event.pathParameters.employeeId;
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
      message: `Failed to process${employeeId} employee operation.`,
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }

  return response;
};

// This program is for getting the employee details based http GET method.
const {
  GetItemCommand, // Retrieve data fron dynamoDb table
  DynamoDBClient, // Dynamodb instance
  ScanCommand,
  UpdateItemCommand, //Scan the table
} = require('@aws-sdk/client-dynamodb'); //aws-sdk is used to build rest APIs,
//client-dynamodb library used to communicate with the

//This function will get employee details based on employeeId
//Create function as async with event as argument
const handleGetEmployeeSalaryInfo = async (event) => {
  //Initialize status code 200 OK
  const response = { statusCode: 200 };
  console.log(
    'event data in request - ',
    event.resource,
    event.path,
    event.headers.Accept,
    event.httpMethod,
    event.body
  );
  switch (`${event.resource} ${event.httpMethod}`) {
    case '/employee/{employeeId}/salaryInfo GET':
      const employeeId = event.pathParameters.employeeId;
      //Try block code - this block evaluates the employee retrieve function based on employeeId,
      // If true it gives employee details or it catches server response error and displayes at console
      try {
        // Define tablename and employeeId key with its value
        const params = {
          TableName: process.env.DYNAMODB_TABLE_NAME,
          Key: marshall({ employeeId: employeeId }),
          ProjectionExpression: 'employeeId, salaryInfo',
        };
        //Await response from client when sent GetItemCommand
        //With params as argument containing tablename and key
        const { Item } = await client.send(new GetItemCommand(params));
        if (Item) {
          //If item is present then send details
          response.body = JSON.stringify({
            message: `Successfully retrieved employee details of employeeId : ${employeeId}.`,
            data: unmarshall(Item),
          });
        } else if (Item === undefined) {
          //If Item is not found then send 404 error
          response.statusCode = 404;
          response.body = JSON.stringify({
            message: `Employee details not found for employeeId : ${employeeId}.`,
          });
        } else {
          response.statusCode = 500;
          throw new Error(
            `Unexpected error occurred while fetching employeeId : ${employeeId}.`
          );
        }
      } catch (e) {
        // Catch block to handle any errors
        console.error(e);
        response.body = JSON.stringify({
          statusCode: response.statusCode,
          message: `Failed to get employee details with employeeId : ${employeeId}.`,
          errorMsg: e.message,
          errorStack: e.stack,
        });
      }
      break;

    case '/employees/salaryInfo GET':
      try {
        const input = {
          TableName: process.env.DYNAMODB_TABLE_NAME,
          ProjectionExpression: 'employeeId, salaryInfo',
        };
        //Await response from client when sent scan command with tablename
        const { Items } = await client.send(new ScanCommand(input));
        if (Items.length === 0) {
          // If employees are not present
          response.statusCode = 404; // Setting the status code to 404
          response.body = JSON.stringify({
            message: 'Employees details are not found.',
          });
        } else {
          // Generate response message and data
          response.body = JSON.stringify({
            message: 'Successfully retrieved all employees.',
            data: Items?.map((item) => unmarshall(item)),
          });
        }
      } catch (e) {
        // Catch block to handle any server response errors
        console.error(e);
        response.body = JSON.stringify({
          message: 'Failed to retrieve all employees.',
          errorMsg: e.message,
          errorStack: e.stack,
        });
      }
      break;

    default:
      response.statusCode = 404;
      response.body = JSON.stringify({
        message: `URL not found -  ${event.resource}`,
      });
  }
  //Return response with statusCode and data.
  return response;
};

module.exports = {
  handleGetEmployeeSalaryInfo,
  handleDeleteOperation,
};