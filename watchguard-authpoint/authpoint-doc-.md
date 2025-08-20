Authentication API
Version: 1.2.0

Download the API specification

Introduction
The Authentication API is a RESTful API that you can use to add the protection of AuthPoint multi-factor authentication (MFA) to custom applications.

This API documentation explains how to access the Authentication API and includes examples to help you get started.

Get Started
This section describes how to submit requests to the Authentication API.

The Authentication API URL is:

https://{base API URL}/rest/authpoint/authentication/

The base URL for WatchGuard public APIs varies by region. The base API URL for your account appears on the Managed Access page in your WatchGuard Cloud account.

To use the Authentication API, you must first enable API access in your WatchGuard Cloud account and make an API request to generate an access token for authentication. For more information, see Get Started with WatchGuard APIs.

Configure a Resource for the API in AuthPoint
Before you can make requests to the API, you must configure a RESTful API Client resource in the AuthPoint management UI. This resource represents your API client, and is added to the authentication policies that determine how users can authenticate.

To configure an API resource:

Log in to your WatchGuard Cloud subscriber account.
Select Configure > AuthPoint.
Select Resources.
From the Choose a resource type drop-down list, select RESTful API Client. Click Add.
Type a name for your API resource. Click Save.
Click the name of your API resource. On the Edit Resource page, note the account ID and resource ID values. You need these values when you make requests to the Authentication API.
Add an authentication policy for the API resource, or add the API resource to your existing authentication policies. Authentication policies specify which resources require authentication and how users authenticate. For more information, see the AuthPoint Help.
Endpoint Path Parameters
All Authentication API endpoint URIs include two required path parameters, the accountId that identifies your WatchGuard Cloud account and the resourceId that identifies the API resource making the request.

Each WatchGuard public API has a version, expressed as <major>.<minor>.<patch>. You also specify the major API version, such as v1, as part of the endpoint URI path.

Some endpoint URIs include additional required path parameters. For example, to check the status of a push notification or validate a QR code you must include the transactionId to identify the push notification or QR code to validate.

Authentication
WatchGuard public APIs use the Open Authorization (OAuth) 2.0 authorization framework for token-based authentication. To use the Authentication API, you must first enable API access in your WatchGuard Cloud account and make an API request to generate an access token.

You must include the access token and the API Key in the header of each request you make to the Authentication API.

For more information, see Authentication.

Request Headers
You must include this information in the header of each request you make to the Authentication API:

Content-Type

application/json

Accept

application/json

Authorization

The access token that you generate with the WatchGuard Authentication API. For more information, see Authentication.

WatchGuard-API-Key

The API Key associated with your WatchGuard Cloud account (shown on the Managed Access page in WatchGuard Cloud).

Authentication Policies
In the AuthPoint management UI, the authentication policies determine which resources users can authenticate to and which authentication methods they can use.

For more information about authentication policies, see the AuthPoint Help.

Check the Authentication Policy for a User
/{v1}/accounts/{accountId}/resources/{resourceId}/authenticationpolicy

Send a request to this endpoint to check the authentication policy for a user's AuthPoint group. The response indicates whether the specified user can authenticate and which authentication methods they can use (push, QR code, and OTP).

This request also returns information about the status of the user and checks if the user has the Forgot Token feature enabled.

We recommend that you send a request to this endpoint to check the authentication policy for your RESTful API Client resource before you provide the user with authentication options.

Path Parameters
When you send a request to this endpoint, you must include these path parameters:

accountId
string
REQUIRED

Identifies your WatchGuard Cloud account. You can see your accountId on the RESTful API Client resource page in the AuthPoint management UI.

Example: WGC-1-123abc456 or ACC-1234567

resourceId
number
REQUIRED

Identifies the API resource making the request. You can see the resourceId on the RESTful API Client resource page in the AuthPoint management UI.

Example: 6789

Request Body
login
string
REQUIRED

Identifies the user to validate. This must be the email address or the user name of the user to validate.

Example: jdoe or jane.doe@example.com

originIpAddress
string

The end user IP address. This is used to check if the user is in a network location.

If the authentication policy has a network location configured, but this parameter is empty, the user is not considered to be in a network location.

For more information about network locations, see the AuthPoint Help.

Example: 198.51.100.98

Example Request
This request checks whether the user jdoe can authenticate and which authentication methods they can use based on the authentication policy that includes the RESTful API Client resource and their AuthPoint group.

curl -X POST 
	https://api.usa.cloud.watchguard.com/rest/authpoint/authentication/v1/accounts/ACC-1234567/resources/1234/authenticationpolicy 
	-H 'Authorization: Bearer eyJraWQiOiJNWnpabklNK2V6Q3BXUE5mM2FXTHhoSmEza0ltcEFMbnluT05DcFdIT2tZPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJjNDQyMTJlMi05MmI1LTRiOTYtYTRmNS1lYWRlODA4OTM1YjIiLCJjdXN0b206YXBpX2tleXMiOiJwMHM1UmQzUkF2NlR2d0VuWEx5YUphR2x0ZWtieEFVUzcwVGVzOXlGIiwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLXdlc3QtMi5hbWF6b25hd3MuY29tXC91cy13ZXN0LTJfa3hXeFdrTFZ5IiwiY29nbml0bzp1c2VybmFtZSI6IjAyNjk0OWM1OWI2NzIxOGNfcndfaWQiLCJhdWQiOiIzb3AybDBqazkxN3FudXFoZnVoanRvcXRzZyIsImV2ZW50X2lkIjoiODczM2ZmMjktOGNhMC00ODMyLTg0NzgtMDNiNWIxMDI3NmQ3IiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE1NjkzNTM0NDEsIm5hbWUiOiIwMjY5NDljNTliNjcyMThjX3J3X2lkIiwiY3VzdG9tOmFjY291bnRfaWQiOiJBQ0MtMTIzNTA2OCIsImV4cCI6MTU2OTM1NzA0MSwiY3VzdG9tOnJvbGUiOiIxIiwiaWF0IjoxNTY5MzUzNDQxfQ.MUAeG6QyM7Zog8mM--WK2uJVevLRwz8z2KPpGhQbUnHK04Hy_JdO4F4wH6IV0WVENGsBrcjp5boxcBZgdJE46123MGnB0HvghN5IoAZUOkfFPm7SAN68posHqYLoo14YNedc5GtvOzCxTmi9YepvE5LhsoC6Tgyc0e3ABn18gEZsyxmJFcMBHXOMei7AssYSWAdDyoI7j6jZslxmhXj7_h6T9PyqjLxLjFEq5S6oK9u4IVDVBlRxbURaRVAGb7ywfHiZEPDgceV-Wnv0AIhDzj5dL28AmiGIkWtWinF0UD-NSMKN4vtszK2sUWUSl8ZfVNGU650heiAaUAy7XmiqbA'
	-H 'Content-Type: application/json' 
	-H 'WatchGuard-API-Key: s9t7El6RZFg8UcmRhYKdwXqBhyuioiWER83Nqd0tL' 
	-d '{
		"login": "jdoe",
		"originIpAddress": "198.51.100.98"
	}'
Example Response
The response indicates that the user jdoe has an authentication policy for the RESTful API Client resource and can authenticate with a password and QR code or a password and a push notification.

{
	"username": "jdoe",
	"email": "jane.doe@example.com",
	"hasPolicy": true,
	"policyResponse": {
		"password": true,
		"otp": false,
		"qrCode": true,
		"push": true
		}
	"isInQuarantine": false,
	"isAllowedToAuthenticate": true,
	"isInSafeLocation": false,
	"isInForgotToken": false,
	"isBlocked": false,
	"isOverallocated": false,
}
This table lists and describes the data returned in the response:

username
string

The user name of the user to validate.

Example: exampleuser

email
string

The email address of the user to validate.

Example: user@example.com

hasPolicy
boolean

Indicates if the user belongs to a group that has an authentication policy for this RESTful API Client resource.

PolicyResponse

The available authentication methods specified by the authentication policy for the RESTful API Client resource.

password
boolean

Indicates if the user is allowed to authenticate with a password. If additional authentication methods are available, the user must authenticate with their password and another authentication method.

otp
boolean

Indicates if the user is allowed to authenticate with a one-time password (OTP).

qrCode
boolean

Indicates if the user is allowed to authenticate with a QR code.

push
boolean

Indicates if the user is allowed to authenticate with a push notification.

isInQuarantine
boolean

Indicates if the user is quarantined. Quarantined users cannot authenticate.

For more information about quarantined users, see the AuthPoint Help.

isInSafeLocation
boolean

AuthPoint no longer supports safe locations (safe locations have been replaced by network locations). This parameter is still included in responses, but always returns false.

isAllowedToAuthenticate
boolean

Indicates if the user can authenticate.

isInOverallocated
boolean

Indicates if the user is overallocated. Overallocated users cannot authenticate.

Overallocated users are AuthPoint users added to your account in excess of the number of licensed users available to you.

isInForgotToken
boolean

Indicates if the user has the Forgot Token feature activated. If Forgot Token is active, the user can authenticate with only their password.

For more information about the Forgot Token feature, see the AuthPoint Help.

isBlocked
boolean

Indicates if the user is blocked. Blocked users cannot authenticate.

Operators can block users in the AuthPoint management UI. For more information, see the AuthPoint Help.

Authenticate End Users
With AuthPoint MFA, users must authenticate to access protected resources. The authentication methods available are based on the authentication policy for the user's AuthPoint group.

This table lists and describes the available authentication methods:

Method

Description

Password

When the user logs in, they type their AuthPoint password. If MFA is required, the user must authenticate with their password and another authentication method (OTP, QR code, or push).

One-Time Password (OTP)

When the user logs in, they type their OTP. An OTP is a unique, temporary password that the user can see in the AuthPoint mobile app or their third-party hardware token.

QR Code

When the user logs in, they scan a QR code with the AuthPoint mobile app and use the verification code they receive to authenticate.

Push Notification

When the user logs in, AuthPoint sends a push notification to their mobile device. The user can either approve the push notification to authenticate and log in, or they can deny the push notification to prevent an unauthorized access attempt.

For more information about authentication methods, see the AuthPoint Help.

Endpoints:

/{v1}/accounts/{accountId}/resources/{resourceId}/password

/{v1}/accounts/{accountId}/resources/{resourceId}/otp

/{v1}/accounts/{accountId}/resources/{resourceId}/qrcode

/{v1}/accounts/{accountId}/resources/{resourceId}/transactions

/{v1}/accounts/{accountId}/resources/{resourceId}/transactions/{transactionId}

Authenticate a User with Only a Password
/{v1}/accounts/{accountId}/resources/{resourceId}/password

Send a request to this endpoint to authenticate a user that logs in to a resource with only their password. This can be used for:

Users with an authentication policy that includes the RESTful API Client resource and only requires a password.
Users with the Forgot Token feature enabled.
Path Parameters
When you send a request to this endpoint, you must include these path parameters:

accountId
string
REQUIRED

Identifies your WatchGuard Cloud account. You can see your accountId on the RESTful API Client resource page in the AuthPoint management UI.

Example: WGC-1-123abc456 or ACC-1234567

resourceId
number
REQUIRED

Identifies the API resource making the request. You can see the resourceId on the RESTful API Client resource page in the AuthPoint management UI.

Example: 6789

Request Body
login
string
REQUIRED

Identifies the user to validate. This must be the email address or the user name of the user to validate.

Example: jdoe or jane.doe@example.com

password
string
REQUIRED

The password of the user to validate. The password must be filled in clear text.

originIpAddress
string

The end user IP address. This is used to check if the user is in a network location.

If the authentication policy has a network location configured, but this parameter is empty, the user is not considered to be in a network location.

For more information about network locations, see the AuthPoint Help.

Example: 198.51.100.98

Example Request
This is a request to authenticate the user jdoe who logs in with only a password (Password1234).

curl -X POST \
	https://api.usa.cloud.watchguard.com/rest/authpoint/authentication/v1/accounts/ACC-1234567/resources/1234/password \
	-H 'Authorization: Bearer eyJraWQiOiJNWnpabklNK2V6Q3BXUE5mM2FXTHhoSmEza0ltcEFMbnluT05DcFdIT2tZPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJjNDQyMTJlMi05MmI1LTRiOTYtYTRmNS1lYWRlODA4OTM1YjIiLCJjdXN0b206YXBpX2tleXMiOiJwMHM1UmQzUkF2NlR2d0VuWEx5YUphR2x0ZWtieEFVUzcwVGVzOXlGIiwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLXdlc3QtMi5hbWF6b25hd3MuY29tXC91cy13ZXN0LTJfa3hXeFdrTFZ5IiwiY29nbml0bzp1c2VybmFtZSI6IjAyNjk0OWM1OWI2NzIxOGNfcndfaWQiLCJhdWQiOiIzb3AybDBqazkxN3FudXFoZnVoanRvcXRzZyIsImV2ZW50X2lkIjoiODczM2ZmMjktOGNhMC00ODMyLTg0NzgtMDNiNWIxMDI3NmQ3IiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE1NjkzNTM0NDEsIm5hbWUiOiIwMjY5NDljNTliNjcyMThjX3J3X2lkIiwiY3VzdG9tOmFjY291bnRfaWQiOiJBQ0MtMTIzNTA2OCIsImV4cCI6MTU2OTM1NzA0MSwiY3VzdG9tOnJvbGUiOiIxIiwiaWF0IjoxNTY5MzUzNDQxfQ.MUAeG6QyM7Zog8mM--WK2uJVevLRwz8z2KPpGhQbUnHK04Hy_JdO4F4wH6IV0WVENGsBrcjp5boxcBZgdJE46123MGnB0HvghN5IoAZUOkfFPm7SAN68posHqYLoo14YNedc5GtvOzCxTmi9YepvE5LhsoC6Tgyc0e3ABn18gEZsyxmJFcMBHXOMei7AssYSWAdDyoI7j6jZslxmhXj7_h6T9PyqjLxLjFEq5S6oK9u4IVDVBlRxbURaRVAGb7ywfHiZEPDgceV-Wnv0AIhDzj5dL28AmiGIkWtWinF0UD-NSMKN4vtszK2sUWUSl8ZfVNGU650heiAaUAy7XmiqbA' \
	-H 'Content-Type: application/json' \
	-H 'WatchGuard-API-Key: s9t7El6RZFg8UcmRhYKdwXqBhyuioiWER83Nqd0tL' \
	-d '{
		"login": "jdoe",
		"password": "Password1234",
		"originIpAddress": "198.51.100.98"
	}'
Example Response
This response indicates that the user is authorized.

{
	"authenticationResult": "AUTHORIZED",
}
This table lists and describes the data returned in the response for a successful authentication:

authenticationResult
string

Includes the text AUTHORIZED if the user is authorized.

This response indicates that the user is not authorized.

{
	"type": "https://www.watchguard.com/help/docs/api/Content/en-US/multi-factor_authentication/authentication/v1/authentication.html?cshid=18000#API_Error_Messages",
	"title": "[Authentication] MFA did not authorize",
	"status": 403,
	"detail": "201005001",
	"instance": "https://www.watchguard.com/help/docs/api/Content/en-US/multi-factor_authentication/authentication/v1/authentication.html?cshid=18000#API_Error_Messages"
}
This table lists and describes the data returned in the response if the user is not authorized or if authentication fails:

Error
array

The response error.

type
string

A link to help documentation.

title
string

A description of the error.

status
integer

HTTP status code.

For more information, see Status and Error Codes.

detail
string

Indicates the error code if the user is not authorized or if authentication fails.

instance
string

A link to help documentation.

Authenticate a User with a One-Time Password
/{v1}/accounts/{accountId}/resources/{resourceId}/otp

Send a request to this endpoint to authenticate a user that logs in with a one-time password (OTP).

Path Parameters
When you send a request to this endpoint, you must include these path parameters:

accountId
string
REQUIRED

Identifies your WatchGuard Cloud account. You can see your accountId on the RESTful API Client resource page in the AuthPoint management UI.

Example: WGC-1-123abc456 or ACC-1234567

resourceId
number
REQUIRED

Identifies the API resource making the request. You can see the resourceId on the RESTful API Client resource page in the AuthPoint management UI.

Example: 6789

Request Body
login
string
REQUIRED

Identifies the user to validate. This must be the email address or the user name of the user to validate.

Example: jdoe or jane.doe@example.com

password
string

The password of the user to validate. The password must be filled in clear text.

If the authentication policy for the RESTful API Client resource requires a password, this parameter must include text.

If the authentication policy does not require a password, this parameter must be empty.

otp
string
REQUIRED

The one-time password typed by the user. This must be a six-digit OTP that includes only numbers.

To validate the OTP, AuthPoint compares the value of this field against the value of OTPs generated by each of the user's active tokens.

Example: 395792

originIpAddress
string

The end user IP address. This is used to check if the user is in a network location.

If the authentication policy has a network location configured, but this parameter is empty, the user is not considered to be in a network location.

For more information about network locations, see the AuthPoint Help.

Example: 198.51.100.98

Example Request
This is a request to authenticate the user jdoe who logs in with their password (Password1234) and an OTP (123456). This example includes the password because the authentication policy requires the user to provide their password.

curl -X POST \
	https://api.usa.cloud.watchguard.com/rest/authpoint/authentication/v1/accounts/ACC-1234567/resources/1234/otp \
	-H 'Authorization: Bearer eyJraWQiOiJNWnpabklNK2V6Q3BXUE5mM2FXTHhoSmEza0ltcEFMbnluT05DcFdIT2tZPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJjNDQyMTJlMi05MmI1LTRiOTYtYTRmNS1lYWRlODA4OTM1YjIiLCJjdXN0b206YXBpX2tleXMiOiJwMHM1UmQzUkF2NlR2d0VuWEx5YUphR2x0ZWtieEFVUzcwVGVzOXlGIiwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLXdlc3QtMi5hbWF6b25hd3MuY29tXC91cy13ZXN0LTJfa3hXeFdrTFZ5IiwiY29nbml0bzp1c2VybmFtZSI6IjAyNjk0OWM1OWI2NzIxOGNfcndfaWQiLCJhdWQiOiIzb3AybDBqazkxN3FudXFoZnVoanRvcXRzZyIsImV2ZW50X2lkIjoiODczM2ZmMjktOGNhMC00ODMyLTg0NzgtMDNiNWIxMDI3NmQ3IiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE1NjkzNTM0NDEsIm5hbWUiOiIwMjY5NDljNTliNjcyMThjX3J3X2lkIiwiY3VzdG9tOmFjY291bnRfaWQiOiJBQ0MtMTIzNTA2OCIsImV4cCI6MTU2OTM1NzA0MSwiY3VzdG9tOnJvbGUiOiIxIiwiaWF0IjoxNTY5MzUzNDQxfQ.MUAeG6QyM7Zog8mM--WK2uJVevLRwz8z2KPpGhQbUnHK04Hy_JdO4F4wH6IV0WVENGsBrcjp5boxcBZgdJE46123MGnB0HvghN5IoAZUOkfFPm7SAN68posHqYLoo14YNedc5GtvOzCxTmi9YepvE5LhsoC6Tgyc0e3ABn18gEZsyxmJFcMBHXOMei7AssYSWAdDyoI7j6jZslxmhXj7_h6T9PyqjLxLjFEq5S6oK9u4IVDVBlRxbURaRVAGb7ywfHiZEPDgceV-Wnv0AIhDzj5dL28AmiGIkWtWinF0UD-NSMKN4vtszK2sUWUSl8ZfVNGU650heiAaUAy7XmiqbA' \
	-H 'Content-Type: application/json' \
	-H 'WatchGuard-API-Key: s9t7El6RZFg8UcmRhYKdwXqBhyuioiWER83Nqd0tL' \
	-d '{
		"login": "jdoe",
		"password": "Password1234",
		"otp": "123456",
		"originIpAddress": "198.51.100.98"
	}'
Example Response
This response indicates that the user is authorized.

{
	"authenticationResult": "AUTHORIZED",
}
This table lists and describes the data returned in the response for a successful authentication:

authenticationResult
string

Includes the text AUTHORIZED if the user is authorized.

This response indicates that the user is not authorized.

{
	"type": "https://www.watchguard.com/help/docs/api/Content/en-US/multi-factor_authentication/authentication/v1/authentication.html?cshid=18000#API_Error_Messages",
	"title": "[Authentication] MFA did not authorize",
	"status": 403,
	"detail": "201005001",
	"instance": "https://www.watchguard.com/help/docs/api/Content/en-US/multi-factor_authentication/authentication/v1/authentication.html?cshid=18000#API_Error_Messages"
}
This table lists and describes the data returned in the response if the user is not authorized or if authentication fails:

Error
array

The response error.

type
string

A link to help documentation.

title
string

A description of the error.

status
integer

HTTP status code.

For more information, see Status and Error Codes.

detail
string

Indicates the error code if the user is not authorized or if authentication fails.

instance
string

A link to help documentation.

Send a Push or Generate a QR Code for Authentication
/{v1}/accounts/{accountId}/resources/{resourceId}/transactions

To authenticate a user with a push notification or a QR code, you must first generate an MFA transaction. Send a request to this endpoint to generate an MFA transaction and either send a push notification to the user or generate a QR code for the user to scan.

To authenticate the user, after you generate an MFA transaction you must send a request to validate a QR code authentication or validate a push authentication.

Path Parameters
When you send a request to this endpoint, you must include these path parameters:

accountId
string
REQUIRED

Identifies your WatchGuard Cloud account. You can see your accountId on the RESTful API Client resource page in the AuthPoint management UI.

Example: WGC-1-123abc456 or ACC-1234567

resourceId
number
REQUIRED

Identifies the API resource making the request. You can see the resourceId on the RESTful API Client resource page in the AuthPoint management UI.

Example: 6789

Request Body
login
string
REQUIRED

Identifies the user to validate. This must be the email address or the user name of the user to validate.

Example: jdoe or jane.doe@example.com

password
string

The password of the user to validate. The password must be filled in clear text.

If the authentication policy for the RESTful API Client resource requires a password, this parameter must include text.

If the authentication policy does not require a password, this parameter must be empty.

originIpAddress
string

The end user IP address. This is used to check if the user is in a network location.

If the authentication policy has a network location configured, but this parameter is empty, the user is not considered to be in a network location.

For more information about network locations, see the AuthPoint Help.

Example: 198.51.100.98

type
string
REQUIRED

The type of MFA transaction to generate. The type can be PUSH or QRCODE.

clientInfoRequest
string

The client information from a transaction request.

machineName
string

The name of the device that the end user authenticates from.

To provide context to the user, this value appears in the details of the push notification and when the QR code is scanned.

osVersion
string

The operating system of the device that the end user authenticates from.

To provide context to the user, this value appears in the details of the push notification and when the QR code is scanned.

domain
string

The domain of the device that the end user authenticates from.

To provide context to the user, this value appears in the details of the push notification and when the QR code is scanned.

Example Request
This request validates the password for the user jdoe and generates a QR code that is used to authenticate. In this example, the password is included because the authentication policy requires the user to provide their password.

curl -X POST \
	https://api.usa.cloud.watchguard.com/rest/authpoint/authentication/v1/accounts/ACC-1234567/resources/1234/transactions \
	-H 'Authorization: Bearer eyJraWQiOiJNWnpabklNK2V6Q3BXUE5mM2FXTHhoSmEza0ltcEFMbnluT05DcFdIT2tZPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJjNDQyMTJlMi05MmI1LTRiOTYtYTRmNS1lYWRlODA4OTM1YjIiLCJjdXN0b206YXBpX2tleXMiOiJwMHM1UmQzUkF2NlR2d0VuWEx5YUphR2x0ZWtieEFVUzcwVGVzOXlGIiwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLXdlc3QtMi5hbWF6b25hd3MuY29tXC91cy13ZXN0LTJfa3hXeFdrTFZ5IiwiY29nbml0bzp1c2VybmFtZSI6IjAyNjk0OWM1OWI2NzIxOGNfcndfaWQiLCJhdWQiOiIzb3AybDBqazkxN3FudXFoZnVoanRvcXRzZyIsImV2ZW50X2lkIjoiODczM2ZmMjktOGNhMC00ODMyLTg0NzgtMDNiNWIxMDI3NmQ3IiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE1NjkzNTM0NDEsIm5hbWUiOiIwMjY5NDljNTliNjcyMThjX3J3X2lkIiwiY3VzdG9tOmFjY291bnRfaWQiOiJBQ0MtMTIzNTA2OCIsImV4cCI6MTU2OTM1NzA0MSwiY3VzdG9tOnJvbGUiOiIxIiwiaWF0IjoxNTY5MzUzNDQxfQ.MUAeG6QyM7Zog8mM--WK2uJVevLRwz8z2KPpGhQbUnHK04Hy_JdO4F4wH6IV0WVENGsBrcjp5boxcBZgdJE46123MGnB0HvghN5IoAZUOkfFPm7SAN68posHqYLoo14YNedc5GtvOzCxTmi9YepvE5LhsoC6Tgyc0e3ABn18gEZsyxmJFcMBHXOMei7AssYSWAdDyoI7j6jZslxmhXj7_h6T9PyqjLxLjFEq5S6oK9u4IVDVBlRxbURaRVAGb7ywfHiZEPDgceV-Wnv0AIhDzj5dL28AmiGIkWtWinF0UD-NSMKN4vtszK2sUWUSl8ZfVNGU650heiAaUAy7XmiqbA' \
	-H 'Content-Type: application/json' \
	-H 'WatchGuard-API-Key: s9t7El6RZFg8UcmRhYKdwXqBhyuioiWER83Nqd0tL' \
	-d '{
		"login": "jdoe",
		"password": "Password1234",
		"type": "QRCODE",
		"originIpAddress": "198.51.100.98",
		"clientInfoRequest": {
			"machineName": "JaneMacbook",
			"osVersion": "macOS Mojave",
			"domain": "example.com"
			}
	}'
Example Response
This response provides information for the generated MFA transaction.

{
	"transactionId": "622ab789-1c50-44c32-r2d4-e1774c76ec40",
	"command": "RMnhfUJVdijGihOwxuW+XQ==:O/ht8u/eG81tx4h9yME/iemf4MnL8OBhR8bUo9B4Ry4bBRnduflMXo6mUJ98rgRlSFsh5fzoj8do1Ox6cbb5jdqhMo/z5LXNejkTkVZfmR9gH0pWRC0ahL5E5zceFXTlqyfzEjmQBjNooLxZGenzJkQkKXIhKeZv11QYyWu9YrirpmBRlFcRyXFPBjYeYrAHFVqYGjOT4PSjT/ADvw597eV5ITwUMdfenhegol+aZ/5y03zVpTwEsQYS3o9Hpenb5GulIwhayErEJBg5x/XiNBDdfK8vZbCEYtpOjh3ySOU="
}
This table lists and describes the data returned in the response:

transactionId
string

The transaction ID identifies the push notification or QR code to validate. When you generate a push notification or QR code, the response contains this value.

Example: 03b68c49-3770-4f71-9f90-c0da1fc9584e

command
string

The QRCode command. This is only included when you generate a QR code.

This response indicates that the user is not authorized and an MFA transaction was not generated.

{
	"type": "https://www.watchguard.com/help/docs/api/Content/en-US/multi-factor_authentication/authentication/v1/authentication.html?cshid=18000#API_Error_Messages",
	"title": "[Authentication] MFA did not authorize",
	"status": 403,
	"detail": "201005001",
	"instance": "https://www.watchguard.com/help/docs/api/Content/en-US/multi-factor_authentication/authentication/v1/authentication.html?cshid=18000#API_Error_Messages"
}
This table lists and describes the data returned in the response if the user is not authorized or if authentication fails:

Error
array

The response error.

type
string

A link to help documentation.

title
string

A description of the error.

status
integer

HTTP status code.

For more information, see Status and Error Codes.

detail
string

Indicates the error code if the user is not authorized or if authentication fails.

instance
string

A link to help documentation.

Validate QR Code Authentication
/{v1}/accounts/{accountId}/resources/{resourceId}/qrcode

Send a request to this endpoint to authenticate a user that logs in with a QR code. This validates the verification code provided by a user after they scan the generated QR code.

For more information about QR code authentication, see the AuthPoint Help.

To authenticate with a QR code, you must first send a request to the /v1/accounts/{accountId}/resources/{resourceId}/transactions endpoint to generate an MFA transaction.

Path Parameters
When you send a request to this endpoint, you must include these path parameters:

accountId
string
REQUIRED

Identifies your WatchGuard Cloud account. You can see your accountId on the RESTful API Client resource page in the AuthPoint management UI.

Example: WGC-1-123abc456 or ACC-1234567

resourceId
number
REQUIRED

Identifies the API resource making the request. You can see the resourceId on the RESTful API Client resource page in the AuthPoint management UI.

Example: 6789

Request Body
login
string
REQUIRED

Identifies the user to validate. This must be the email address or the user name of the user to validate.

Example: jdoe or jane.doe@example.com

qrCodeResponse
string
REQUIRED

The verification code that the user receives when they scan the QR code. When you generate a QR code and render it to show in the UI on the authentication page, a six-digit verification code is generated.

Example: 123789

transactionId
string
REQUIRED

Identifies the QR code to validate.

When you make an API request to generate a QR code, the response body contains this value in the transactionId parameter.

Example: 03b68c49-3770-4f71-9f90-c0da1fc9584e

originIpAddress
string

The end user IP address. This is used to check if the user is in a network location.

If the authentication policy has a network location configured, but this parameter is empty, the user is not considered to be in a network location.

For more information about network locations, see the AuthPoint Help.

Example: 198.51.100.98

Example Request
This request authenticates a user that has scanned a QR code and provided a verification code (qrCodeResponse) of 123456.

curl -X POST \
	https://api.usa.cloud.watchguard.com/rest/authpoint/authentication/v1/accounts/ACC-1234567/resources/1234/qrcode \
	-H 'Authorization: Bearer eyJraWQiOiJNWnpabklNK2V6Q3BXUE5mM2FXTHhoSmEza0ltcEFMbnluT05DcFdIT2tZPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJjNDQyMTJlMi05MmI1LTRiOTYtYTRmNS1lYWRlODA4OTM1YjIiLCJjdXN0b206YXBpX2tleXMiOiJwMHM1UmQzUkF2NlR2d0VuWEx5YUphR2x0ZWtieEFVUzcwVGVzOXlGIiwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLXdlc3QtMi5hbWF6b25hd3MuY29tXC91cy13ZXN0LTJfa3hXeFdrTFZ5IiwiY29nbml0bzp1c2VybmFtZSI6IjAyNjk0OWM1OWI2NzIxOGNfcndfaWQiLCJhdWQiOiIzb3AybDBqazkxN3FudXFoZnVoanRvcXRzZyIsImV2ZW50X2lkIjoiODczM2ZmMjktOGNhMC00ODMyLTg0NzgtMDNiNWIxMDI3NmQ3IiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE1NjkzNTM0NDEsIm5hbWUiOiIwMjY5NDljNTliNjcyMThjX3J3X2lkIiwiY3VzdG9tOmFjY291bnRfaWQiOiJBQ0MtMTIzNTA2OCIsImV4cCI6MTU2OTM1NzA0MSwiY3VzdG9tOnJvbGUiOiIxIiwiaWF0IjoxNTY5MzUzNDQxfQ.MUAeG6QyM7Zog8mM--WK2uJVevLRwz8z2KPpGhQbUnHK04Hy_JdO4F4wH6IV0WVENGsBrcjp5boxcBZgdJE46123MGnB0HvghN5IoAZUOkfFPm7SAN68posHqYLoo14YNedc5GtvOzCxTmi9YepvE5LhsoC6Tgyc0e3ABn18gEZsyxmJFcMBHXOMei7AssYSWAdDyoI7j6jZslxmhXj7_h6T9PyqjLxLjFEq5S6oK9u4IVDVBlRxbURaRVAGb7ywfHiZEPDgceV-Wnv0AIhDzj5dL28AmiGIkWtWinF0UD-NSMKN4vtszK2sUWUSl8ZfVNGU650heiAaUAy7XmiqbA' \
	-H 'Content-Type: application/json' \
	-H 'WatchGuard-API-Key: s9t7El6RZFg8UcmRhYKdwXqBhyuioiWER83Nqd0tL' \
	-d '{
		"login": "jdoe",
		"qrCodeResponse": "123456",
		"originIpAddress": "198.51.100.98",
		"transactionId": "291fi8r0-g5b4-6e56-7654-rt65tr6268c8"
	}'
Example Response
This response indicates that the user is authorized.

{
	"authenticationResult": "AUTHORIZED",
}
This table lists and describes the data returned in the response for a successful authentication:

authenticationResult
string

Includes the text AUTHORIZED if the user is authorized.

This response indicates that the user is not authorized.

{
	"type": "https://www.watchguard.com/help/docs/api/Content/en-US/multi-factor_authentication/authentication/v1/authentication.html?cshid=18000#API_Error_Messages",
	"title": "[Authentication] MFA did not authorize",
	"status": 403,
	"detail": "201005001",
	"instance": "https://www.watchguard.com/help/docs/api/Content/en-US/multi-factor_authentication/authentication/v1/authentication.html?cshid=18000#API_Error_Messages"
}
This table lists and describes the data returned in the response if the user is not authorized or if authentication fails:

Error
array

The response error.

type
string

A link to help documentation.

title
string

A description of the error.

status
integer

HTTP status code.

For more information, see Status and Error Codes.

detail
string

Indicates the error code if the user is not authorized or if authentication fails.

instance
string

A link to help documentation.

Validate Push Authentication
/{v1}/accounts/{accountId}/resources/{resourceId}/transactions/{transactionId}

Send a request to this endpoint to check the status of the push notification sent to the user and to authenticate the user.

If the user approves the push notification, they are authenticated. If the user denies the push notification or the push notification times out or fails for some other reason, the user is not authenticated.

To authenticate with a push notification, you must first send a request to the /v1/accounts/{accountId}/resources/{resourceId}/transactions endpoint to generate an MFA transaction.

Path Parameters
When you send a request to this endpoint, you must include these path parameters:

accountId
string
REQUIRED

Identifies your WatchGuard Cloud account. You can see your accountId on the RESTful API Client resource page in the AuthPoint management UI.

Example: WGC-1-123abc456 or ACC-1234567

resourceId
string
REQUIRED

Identifies the API resource making the request. You can see the resourceId on the RESTful API Client resource page in the AuthPoint management UI.

Example: WGC-1-123abc456 or ACC-1234567

transactionId
string
REQUIRED

Identifies the push notification to validate.

When you make an API request to generate a push notification, the response body contains this value in the transactionId parameter.

Example: 03b68c49-3770-4f71-9f90-c0da1fc9584e

Example Request
This request checks the status of a push notification with the transactionId 291fi8r0-g5b4-6e56-7654-rt65tr6268c8 to authenticate a user.

curl -X GET \
	https://api.usa.cloud.watchguard.com/rest/authpoint/authentication/v1/accounts/ACC-1234567/resources/1234/transactions/291fi8r0-g5b4-6e56-7654-rt65tr6268c8 \
	-H 'Authorization: Bearer eyJraWQiOiJNWnpabklNK2V6Q3BXUE5mM2FXTHhoSmEza0ltcEFMbnluT05DcFdIT2tZPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJjNDQyMTJlMi05MmI1LTRiOTYtYTRmNS1lYWRlODA4OTM1YjIiLCJjdXN0b206YXBpX2tleXMiOiJwMHM1UmQzUkF2NlR2d0VuWEx5YUphR2x0ZWtieEFVUzcwVGVzOXlGIiwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLXdlc3QtMi5hbWF6b25hd3MuY29tXC91cy13ZXN0LTJfa3hXeFdrTFZ5IiwiY29nbml0bzp1c2VybmFtZSI6IjAyNjk0OWM1OWI2NzIxOGNfcndfaWQiLCJhdWQiOiIzb3AybDBqazkxN3FudXFoZnVoanRvcXRzZyIsImV2ZW50X2lkIjoiODczM2ZmMjktOGNhMC00ODMyLTg0NzgtMDNiNWIxMDI3NmQ3IiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE1NjkzNTM0NDEsIm5hbWUiOiIwMjY5NDljNTliNjcyMThjX3J3X2lkIiwiY3VzdG9tOmFjY291bnRfaWQiOiJBQ0MtMTIzNTA2OCIsImV4cCI6MTU2OTM1NzA0MSwiY3VzdG9tOnJvbGUiOiIxIiwiaWF0IjoxNTY5MzUzNDQxfQ.MUAeG6QyM7Zog8mM--WK2uJVevLRwz8z2KPpGhQbUnHK04Hy_JdO4F4wH6IV0WVENGsBrcjp5boxcBZgdJE46123MGnB0HvghN5IoAZUOkfFPm7SAN68posHqYLoo14YNedc5GtvOzCxTmi9YepvE5LhsoC6Tgyc0e3ABn18gEZsyxmJFcMBHXOMei7AssYSWAdDyoI7j6jZslxmhXj7_h6T9PyqjLxLjFEq5S6oK9u4IVDVBlRxbURaRVAGb7ywfHiZEPDgceV-Wnv0AIhDzj5dL28AmiGIkWtWinF0UD-NSMKN4vtszK2sUWUSl8ZfVNGU650heiAaUAy7XmiqbA' \
	-H 'Content-Type: application/json' \
	-H 'WatchGuard-API-Key: s9t7El6RZFg8UcmRhYKdwXqBhyuioiWER83Nqd0tL' \
Example Response
This response indicates that the user is authorized.

{
	"authenticationResult": "AUTHORIZED",
}
This table lists and describes the data returned in the response for a successful authentication:

authenticationResult
string

Includes the text AUTHORIZED if the user is authorized.

This response indicates that the user is not authorized.

{
	"type": "https://www.watchguard.com/help/docs/api/Content/en-US/multi-factor_authentication/authentication/v1/authentication.html?cshid=18000#API_Error_Messages",
	"title": "[Authentication] MFA did not authorize",
	"status": 403,
	"detail": "201005001",
	"instance": "https://www.watchguard.com/help/docs/api/Content/en-US/multi-factor_authentication/authentication/v1/authentication.html?cshid=18000#API_Error_Messages"
}
This table lists and describes the data returned in the response if the user is not authorized or if authentication fails:

Error
array

The response error.

type
string

A link to help documentation.

title
string

A description of the error.

status
integer

HTTP status code.

For more information, see Status and Error Codes.

detail
string

Indicates the error code if the user is not authorized or if authentication fails.

instance
string

A link to help documentation.

Forgot Token
The Forgot Token feature in AuthPoint disables multi-factor authentication for a specific user for a specific amount of time. For the amount of time you specify, the user is not required to authenticate with a mobile device to log in. When the user logs in, they are only required to type the user name and password. For more information about the Forgot Token feature, see the AuthPoint Help.

Here is an overview of the process:

A user forgets or misplaces the mobile device they use for authentication. The user must contact an AuthPoint operator. An operator is a user who can log in to WatchGuard Cloud and the AuthPoint management UI. For more information about operators, see the AuthPoint Help.
On the log in screen, the user selects the Forgot Token option and provides the activation code value they see to the operator. The activation code is a six-digit string that consists of only numbers that is generated by the client application.
The operator provides a period value and a verification code to the user (generated in the AuthPoint management UI).
The user types their password and validates the period and verification code. Once validated, the user can log in with their password.
For more information about the Forgot Token feature, see the AuthPoint Help.

Enable a User to Log in Without MFA
/{v1}/accounts/{accountId}/resources/{resourceId}/forgottoken

Send a request to this endpoint to enable the Forgot Token feature for a user.

Path Parameters
When you send a request to this endpoint, you must include these path parameters:

accountId
string
REQUIRED

Identifies your WatchGuard Cloud account. You can see your accountId on the RESTful API Client resource page in the AuthPoint management UI.

Example: WGC-1-123abc456 or ACC-1234567

resourceId
number
REQUIRED

Identifies the API resource making the request. You can see the resourceId on the RESTful API Client resource page in the AuthPoint management UI.

Example: 6789

Request Body
login
string
REQUIRED

Identifies the user to validate. This must be the email address or the user name of the user to validate.

Example: jdoe or jane.doe@example.com

password
string
REQUIRED

The password of the user to validate. The password must be filled in clear text.

activationCode
string
REQUIRED

The activation code value generated by the client application. This value can be any six-digit string that consists of only numbers.

This value must be visible to the end user so they can provide it to the AuthPoint operator. The operator uses this value to generate the verification code in the AuthPoint management UI.

Example: 123456

verificationCode
string
REQUIRED

The verification code is the six-digit value generated in the AuthPoint management UI and provided to the user by the operator.

AuthPoint verifies this value with the activation code and the interval to enable Forgot Token mode.

Example: 654321

interval
string
REQUIRED

The number of hours that Forgot Token is active for the user. An operator defines this value in the AuthPoint management UI and provides it to the user.

The interval must be between 1 and 72 hours.

Example Request
This request enables Forgot Token for a user and logs in the user with a password.

curl -X POST \
	https://api.usa.cloud.watchguard.com/rest/authpoint/authentication/v1/accounts/ACC-1234567/resources/1234/qrcode \
	-H 'Authorization: Bearer eyJraWQiOiJNWnpabklNK2V6Q3BXUE5mM2FXTHhoSmEza0ltcEFMbnluT05DcFdIT2tZPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJjNDQyMTJlMi05MmI1LTRiOTYtYTRmNS1lYWRlODA4OTM1YjIiLCJjdXN0b206YXBpX2tleXMiOiJwMHM1UmQzUkF2NlR2d0VuWEx5YUphR2x0ZWtieEFVUzcwVGVzOXlGIiwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLXdlc3QtMi5hbWF6b25hd3MuY29tXC91cy13ZXN0LTJfa3hXeFdrTFZ5IiwiY29nbml0bzp1c2VybmFtZSI6IjAyNjk0OWM1OWI2NzIxOGNfcndfaWQiLCJhdWQiOiIzb3AybDBqazkxN3FudXFoZnVoanRvcXRzZyIsImV2ZW50X2lkIjoiODczM2ZmMjktOGNhMC00ODMyLTg0NzgtMDNiNWIxMDI3NmQ3IiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE1NjkzNTM0NDEsIm5hbWUiOiIwMjY5NDljNTliNjcyMThjX3J3X2lkIiwiY3VzdG9tOmFjY291bnRfaWQiOiJBQ0MtMTIzNTA2OCIsImV4cCI6MTU2OTM1NzA0MSwiY3VzdG9tOnJvbGUiOiIxIiwiaWF0IjoxNTY5MzUzNDQxfQ.MUAeG6QyM7Zog8mM--WK2uJVevLRwz8z2KPpGhQbUnHK04Hy_JdO4F4wH6IV0WVENGsBrcjp5boxcBZgdJE46123MGnB0HvghN5IoAZUOkfFPm7SAN68posHqYLoo14YNedc5GtvOzCxTmi9YepvE5LhsoC6Tgyc0e3ABn18gEZsyxmJFcMBHXOMei7AssYSWAdDyoI7j6jZslxmhXj7_h6T9PyqjLxLjFEq5S6oK9u4IVDVBlRxbURaRVAGb7ywfHiZEPDgceV-Wnv0AIhDzj5dL28AmiGIkWtWinF0UD-NSMKN4vtszK2sUWUSl8ZfVNGU650heiAaUAy7XmiqbA' \
	-H 'Content-Type: application/json' \
	-H 'WatchGuard-API-Key: s9t7El6RZFg8UcmRhYKdwXqBhyuioiWER83Nqd0tL' \
	-d '{
		"login": "jdoe",
		"password": "Password1234",
		"verificationCode": "321456",
		"activationCode": "123789",
		"interval": 6
	}'
Example Response
This response indicates that the user is authorized.

{
	"authenticationResult": "AUTHORIZED",
}
This response indicates that the user is not authorized.

{
	"type": "https://www.watchguard.com/help/docs/api/Content/en-US/multi-factor_authentication/authentication/v1/authentication.html?cshid=18000#API_Error_Messages",
	"title": "[Authentication] MFA did not authorize",
	"status": 403,
	"detail": "201005001",
	"instance": "https://www.watchguard.com/help/docs/api/Content/en-US/multi-factor_authentication/authentication/v1/authentication.html?cshid=18000#API_Error_Messages"
}
Response Details
This table lists and describes the data returned in the response for a successful authentication:

authenticationResult
string

Includes the text AUTHORIZED if the user is authorized.

This table lists and describes the data returned in the response if the user is not authorized or if authentication fails:

Error
array

The response error.

type
string

A link to help documentation.

title
string

A description of the error.

status
integer

HTTP status code.

For more information, see Status and Error Codes.

detail
string

Indicates the error code if the user is not authorized or if authentication fails.

instance
string

A link to help documentation.

API Error Messages
This table lists and describes the error messages for the Authentication API. You can also see details about authentication errors on the Audit Logs page in WatchGuard Cloud. For more information about audit logs, see the WatchGuard Cloud Help.

Error Code	Description
201.005.001

The authentication attempt is not authorized.

201.005.002

Internal error. Could not generate the MFA request.

201.005.003

MFA is temporarily not available.

201.005.004

The authentication type is not valid.

201.005.005

Cannot communicate with the Gateway.

201.005.006

No authentication response. Cannot communicate with the LDAP source.

201.005.007

LDAP configuration error. There is no ID.

201.005.008

LDAP configuration error. There is no DN.

201.005.009

Could not generate the LDAP Gateway request.

201.005.010

Not authorized.

201.005.011

The LDAP gateway is not available.

201.005.012

Resource not found.

201.005.013

Gateway not found.

201.005.014

Not authorized. The Gateway is not connected.

201.005.015

The OTP is not in the correct format.

201.005.016

Unexpected error.

201.005.017

Unexpected error.

201.005.018

This type of authentication is not supported for LDAP users.

201.005.019

The user is blocked.

201.025.012

User not found.

201.035.001

Unauthorized back end request.

201.045.001

Request is not valid.

201.045.002

Authentication expired.

201.045.003

Authentication is not authorized.

201.045.004

Unexpected error.

201.045.005

Authentication failed.

201.045.006

The authentication transaction status is not valid.

201.045.007

Could not generate the MFA transaction request.

201.045.008

MFA is temporarily not available.

201.045.009

Transaction command error.

201.045.010

Could not generate the transaction data.

201.045.011

User not found.

201.045.012

Transaction push data not found.

201.045.013

The push was not sent.

201.045.014

The push was sent.

201.045.015

The push was received by at least one device.

201.045.016

The push was not received by any device.

201.045.017

The push was not answered by any device.

201.045.018

The transactionId is not valid.

201.055.001

Not authorized.

201.055.002

The request is not valid.

201.055.003

The request is not valid.

201.055.004

There is no license for this account.

201.055.005

The license for this account is expired.

201.055.006

The user is quarantined.

201.055.007

User not found.

201.055.008

The user denied the push notification.

201.055.009

The user is overallocated.

201.055.010

Transaction not found.

201.055.011

Transaction push data not found.

201.055.012

User not found.

201.085.001

The request is not valid.

201.085.002

The AuthnRequest object is not valid.

201.085.003

Unexpected error.

201.085.004

There is no account with this account ID.

201.085.005

The account ID in the security context does not match the account ID in the request.

201.085.006

Service provider not found.

201.085.007

This group does not have an authentication policy for an IdP portal resource.

201.085.008

The user's group is not authorized to log in to this SAML resource.

201.085.009

The authentication policy requires a more secure authentication method.

201.085.010

Reconnecting to the SAML state management microservice.

201.085.011

Unexpected error.

201.085.012

The license for this account is not valid.

201.085.013

The user is quarantined.

201.085.014

Not authorized.

201.085.015

The user is overallocated.

201.085.016

The user cannot authenticate to this SAML resource because federation conditions or attributes are missing.

201.086.001

There is no certificate for this account.

201.086.002

Reconnecting to the certificate management microservice.

201.086.003

The certificate management microservice did not respond correctly.

201.086.004

There was an error with the encryption API microservice response.

201.086.005

Reconnecting to the encryption API microservice.

201.086.006

Could not retrieve the key pair.

201.087.001

Not authorized.

201.087.002

The request is not valid.

201.087.003

Inner SAML error.

201.087.004

Unknown service provider (relying party).

201.105.001

The request is not authorized.

201.105.002

The request is not valid.

201.105.003

Resource not found.

201.105.004

There is no license for this account.

201.105.005

The license for this account is expired.

201.105.006

Gateway not found.

201.105.007

Could not generate a response.

201.115.001

The request is not authorized for this account ID.

201.115.002

Could not read the request body.

201.115.003

The request is not valid.

201.115.004

There is no license for this account.

201.115.005

The license for this account is expired.

201.115.006

Authentication settings not found.

201.115.007

Resource not found.

201.115.008

The user is quarantined.

201.115.009

User not found.

201.115.010

Authentication policy not found.

201.115.011

The user is overallocated.

201.115.012

The token is not valid or missing.

201.115.013

The request is not authorized for this access ID. Make sure that a read/write access ID is required for this request.

201.115.014

The OTP is not in the correct format.

201.115.015

The OTP must be six numbers.

201.115.016

The QR code response is not in the correct format.

201.115.017

The QR code response size is not valid.

201.115.018

The verification code is not in the correct format.

201.115.019

The verification code must be six numbers.

201.115.020

The activation code is not in the correct format.

201.115.021

The activation code size is not valid.

201.115.022

The forgot token interval is not valid.ss