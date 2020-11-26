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
function responseToRows(requestedFields, response, packageName) {
  console.log("Entering responseToRows() method");

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
}

function formatEmailBlasterDate(date){
  return date.split("/").reverse().join("");
}

function getData(request) {
  console.log("Entering getData() method");

  var requestedFieldIds = request.fields.map(function(field) {
    return field.name;
  });
  var requestedFields = getFields().forIds(requestedFieldIds);

  // Fetch and parse data from API
  var url = [
    // 'https://api.npmjs.org/downloads/range/',
    // request.dateRange.startDate,
    // ':',
    // request.dateRange.endDate,
    // '/',
    // request.configParams.package
    "https://api.emailblaster.cloud/2.0/campaign/view/sent/1"
  ];

  var response = UrlFetchApp.fetch(url.join(''), { headers : {"content-type":"application/json", "api_key": request.configParams.apiKey} });

  // var response =
  //   '{"status":"ok","campaigns":[{"id":168,"name":"Pension webinars - reminder","subject":"Pension webinars - reminder","date":"20/11/2020","send_volume":"2115","sent_to":"Pensions E-mail -- 20.11.20","preview":"https://campaign.emailblaster.cloud/MTQ0MTU/168.html"},{"id":167,"name":"ACTION- Graduate Development Programme- PRP Process- Graduates","subject":"ACTION- Graduate Development Programme- PRP Process","date":"19/11/2020","send_volume":"21","sent_to":"Graduates -- 19.11.20","preview":"https://campaign.emailblaster.cloud/MTQ0MTU/167.html"},{"id":166,"name":"ACTION- Graduate Development Programme - PRP Process - Consulting Graduates","subject":"ACTION- Graduate Development Programme - PRP Process","date":"19/11/2020","send_volume":"53","sent_to":"Consulting Graduates -- 19.11.20\u00a0","preview":"https://campaign.emailblaster.cloud/MTQ0MTU/166.html"}]}';

  var parsedResponse = JSON.parse(response).campaigns;
  var rows = responseToRows(
    requestedFields,
    parsedResponse,
    request.configParams.apiKey
  );

  return {
    schema: requestedFields.build(),
    rows: rows
  };

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
}
