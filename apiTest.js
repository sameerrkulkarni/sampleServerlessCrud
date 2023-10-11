const { expect } = require('chai');
const { deleteEmployeeBankInfo, softDeleteEmployeeBankInfo } = require('./api');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');

// Mock DynamoDBClient to avoid making actual AWS calls
const mockClient = {
  send: () => ({
    Attributes: {},
  }),
};

// Mock event object
const event = {
  pathParameters: {
    employeeId: '123',
  },
};

describe('deleteEmployeeBankInfo', () => {
  let originalDynamoDBClient;

  before(() => {
    // Store the original DynamoDBClient and replace it with the mock
    originalDynamoDBClient = DynamoDBClient;
    DynamoDBClient.prototype.send = () => mockClient.send();
  });

  after(() => {
    // Restore the original DynamoDBClient after tests
    DynamoDBClient.prototype.send = originalDynamoDBClient.prototype.send;
  });

  it('should delete employee bank info successfully', async () => {
    const response = await deleteEmployeeBankInfo(event);

    expect(response.statusCode).to.equal(200);

    const responseBody = JSON.parse(response.body);
    expect(responseBody.message).to.equal(
      'Successfully deleted employeeId bank Details.'
    );
    expect(responseBody.updateResult.Attributes).to.deep.equal({});
  });

  it('should handle errors gracefully', async () => {
    // Mock an error by changing the DynamoDBClient behavior
    DynamoDBClient.prototype.send = () => {
      throw new Error('Some error occurred.');
    };

    const response = await deleteEmployeeBankInfo(event);

    expect(response.statusCode).to.equal(500);

    const responseBody = JSON.parse(response.body);
    expect(responseBody.message).to.equal(
      'Failed to delete employeeId bank Details.'
    );
    expect(responseBody.errorMsg).to.equal('Some error occurred.');
    expect(responseBody.errorStack).to.exist;
  });
});

describe('softDeleteEmployeeBankInfo', () => {
  let originalDynamoDBClient;

  beforeEach(async () => {
    // Store the original DynamoDBClient and replace it with the mock
    originalDynamoDBClient = DynamoDBClient;
    DynamoDBClient.prototype.send = () => mockClient.send();
  });

  afterEach(() => {
    // Restore the original DynamoDBClient after tests
    DynamoDBClient.prototype.send = originalDynamoDBClient.prototype.send;
  });

  it('should softdelete employee bank info successfully', async () => {
    const response = await softDeleteEmployeeBankInfo(event);
    expect(response.statusCode).to.equal(200);
    const responseBody = JSON.parse(response.body);
    expect(responseBody.message).to.equal(
      'Successfully soft deleted employeeId bank Details.'
    );
  });

  it('softDelete function should handle the errors gracefully', async () => {
    // Mock an error by changing the DynamoDBClient behavior
    DynamoDBClient.prototype.send = () => {
      throw new Error('Some error occurred.');
    };
    const response = await softDeleteEmployeeBankInfo(event);
    expect(response.statusCode).to.equal(500);
    const responseBody = JSON.parse(response.body);
    expect(responseBody.message).to.equal(
      'Failed to soft delete employeeId bank Details.'
    );
    expect(responseBody.errorMsg).to.equal('Some error occurred.');
    expect(responseBody.errorStack).to.exist;
  });
});