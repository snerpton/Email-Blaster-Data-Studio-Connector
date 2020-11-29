var cc = DataStudioApp.createCommunityConnector();

/*
 * Authorisation type for connector
 */
function getAuthType() {
  console.log("Entering getAuthType() method");
  var AuthTypes = cc.AuthType;
  return cc
    .newAuthTypeResponse()
    .setAuthType(AuthTypes.NONE)
    .build();
}

/*
 * User configuration screen rendered in DataStudio
 */
function getConfig(request) {
  console.log("Entering getConfig() method");

  var config = cc.getConfig();

  config
    .newInfo()
    .setId("instructions")
    .setText(
      "Enter the Email Blaster API key for the account you want to query"
    );

  config
    .newTextInput()
    .setId("apiKey")
    .setName("Enter a single API key")
    .setHelpText(
      "You should be able to find this in your Email Blaster account"
    )
    .setPlaceholder("xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx");

  config.setDateRangeRequired(true);

  return config.build();
}

/*
 * Schema for data returned to DataStudio
 */
function getFields(request) {
  console.log("Entering getFields() method");
  var cc = DataStudioApp.createCommunityConnector();
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;

  console.log("About to create fields...");

  fields
    .newDimension()
    .setId("id")
    .setType(types.NUMBER);

  fields
    .newDimension()
    .setId("date")
    .setType(types.YEAR_MONTH_DAY);

  fields
    .newDimension()
    .setId("name")
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId("subject")
    .setType(types.TEXT);

  fields
    .newMetric()
    .setId("send_volume")
    .setType(types.NUMBER);
  //.setAggregation(aggregations.NONE);

  fields
    .newDimension()
    .setId("sent_to")
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId("preview")
    .setType(types.TEXT);

  fields
    .newDimension()
    .setId("preview_as_link")
    .setType(types.URL);

  console.log("fields", JSON.stringify(fields));

  return fields;
}

function getSchema(request) {
  console.log("Entering getSchema() method");
  var fields = getFields(request).build();

  console.log("fields:");
  console.log(JSON.stringify(fields));

  return { schema: fields };
}

/*
 * Provdes actual requested data to data studio
 */
function responseToRows(requestedFields, response) {
  Logger.log("Entering responseToRows() method");

try {
  return response.map(function(campaign) {
    var row = [];
    requestedFields.asArray().forEach(function(field) {
      switch (field.getId()) {
        case "id":
          return row.push(campaign.id);
        case "date":
          return row.push(formatEmailBlasterDate(campaign.date));
        case "name":
          return row.push(campaign.name);
        case "subject":
          return row.push(campaign.name);
        case "send_volume":
          return row.push(campaign.send_volume);
        case "sent_to":
          return row.push(campaign.sent_to);
        case "preview":
          return row.push(campaign.preview);
        case "preview_as_link":
          return row.push(campaign.preview);
        default:
          return row.push("");
      }
    });
    return { values: row };
  });
} catch (error) {
  Logger.log("There was an error in responseToRows(). Error: ", error);
}


}

function formatEmailBlasterDate(date) {
  return date
    .split("/")
    .reverse()
    .join("");
}

function getData(request) {
  console.log("Entering getData() method");

  // var requestedFieldIds = request.fields.map(function(field) {
  //   return field.name;
  // });
  // var requestedFields = getFields().forIds(requestedFieldIds);

  // // Fetch and parse data from API
  // var url = [
  //   'https://api.npmjs.org/downloads/range/',
  //   request.dateRange.startDate,
  //   ':',
  //   request.dateRange.endDate,
  //   '/',
  //   request.configParams.package
  // ];
  // var response = UrlFetchApp.fetch(url.join(''));
  // var parsedResponse = JSON.parse(response).downloads;
  // var rows = responseToRows(requestedFields, parsedResponse, request.configParams.package);

  // return {
  //   schema: requestedFields.build(),
  //   rows: rows
  // };


//////////////////////////////////////////////////


  // var requestedFieldIds = request.fields.map(function(field) {
  //   return field.name;
  // });
  // var requestedFields = getFields().forIds(requestedFieldIds);

  // // Fetch and parse data from API
  // var url = ["https://api.emailblaster.cloud/2.0/campaign/view/sent/", 1];
  // var response = UrlFetchApp.fetch(url.join(""), {
  //   headers: {
  //     "content-type": "application/json",
  //     api_key: request.configParams.apiKey
  //   }
  // });

  // Logger.log("response.getResponseCode(): ", response.getResponseCode());
  // var parsedResponseRaw = JSON.parse(response);
  // Logger.log("parsedResponseRaw.status: ", parsedResponseRaw.status);

  // var parsedResponse = parsedResponseRaw.campaigns;

  // Logger.log("parsedResponse.length: ", parsedResponse.length);
  // Logger.log('About to create rows: parsedResponse[0]: ', parsedResponse[0]);
  // Logger.log('About to create rows: parsedResponse[parsedResponse.length -1]: ', parsedResponse[parsedResponse.length -1]);
  // Logger.log('JSON.stringify(parsedResponse).substr(0,500)', JSON.stringify(parsedResponse).substr(0,500));

  // var rows = responseToRows(
  //   requestedFields,
  //   parsedResponse
  // );

  // Logger.log('rows[0]: ', rows[0]);
  // Logger.log('rows[rows.length -1]: ', rows[rows.length -1]);
  // Logger.log('rows', rows);

  // return {
  //   schema: requestedFields.build(),
  //   rows: rows
  // };


////////////////////////////////////////////////////////

  var requestedFieldIds = request.fields.map(function(field) {
    return field.name;
  });
  var requestedFields = getFields().forIds(requestedFieldIds);

  Logger.log("About to get response...");

  var urls = [];

  for (let page = 1; page <= 2; page++) {
    var url = ["https://api.emailblaster.cloud/2.0/campaign/view/sent/", page];
    urls.push(url);
    Logger.log("1) page: ", page);
  }

  var totalParsedResponse = [];
  for (let i = 0; i < urls.length; i++) {
    Logger.log("2) page: ", i);
    var response = UrlFetchApp.fetch(urls[i].join(""), {
      headers: {
        "content-type": "application/json",
        api_key: request.configParams.apiKey
      }
    });

    Logger.log("response.getResponseCode(): ", response.getResponseCode());
    var parsedResponseRaw = JSON.parse(response);
    Logger.log("parsedResponseRaw.status: ", parsedResponseRaw.status);
    Logger.log("parsedResponseRaw.campaigns[0]: ", parsedResponseRaw.campaigns[0]);

    var parsedResponse = JSON.parse(response).campaigns;

    Logger.log("parsedResponse[0]: ", parsedResponse[0]);

    for (let i = 0; i < parsedResponse.length; i++) {
      totalParsedResponse.push(parsedResponse[i]);
    }
  }

  Logger.log("totalParsedResponse.length: ", totalParsedResponse.length);
  Logger.log('About to create rows: totalParsedResponse[0]: ', totalParsedResponse[0]);
  Logger.log('About to create rows: totalParsedResponse[totalParsedResponse.length -1]: ', totalParsedResponse[totalParsedResponse.length -1]);
  Logger.log('JSON.stringify(totalParsedResponse).substr(0,500)', JSON.stringify(totalParsedResponse).substr(0,500));

  var rows = responseToRows(
    requestedFields,
    totalParsedResponse
  );

  Logger.log('rows.values[0]: ', rows.values[0]);
  Logger.log('rows.values[rows.values.length -1]: ', rows[rows.values.length -1]);
  Logger.log('rows', rows);
  
  return {
    schema: requestedFields.build(),
    rows: rows
  };
}
