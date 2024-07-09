# SkinsDripPAY API Documentation

*Usage* If you are not using NodeJS, feel free to look at this API documentation for the pay modal

## Base URL
https://api.skinsdrip.com/merchant

## POST /get_session

### Description
This endpoint is used to get a session for a user.

### Endpoint

### Headers
| Key             | Value                      |
|-----------------|----------------------------|
| merchant-id     | your_merchant_id           |
| Content-Type    | application/json           |

### Request Body
The body of the request should be a JSON object containing the following fields:

| Field      | Type   | Description             |
|------------|--------|-------------------------|
| user_id    | string | The ID of the user      |
| signature  | string | The generated signature |

### Signature Generation
To generate the signature, concatenate the values of all fields in the body in the order they are listed (in this case, just the `user_id`), and then append the `merchantSecret`. 

Example:
signature = user_id + merchantSecret

### Response
The response will be a JSON object containing the following fields:

| Field      | Type   | Description                                                               |
|------------|--------|---------------------------------------------------------------------------|
| orderId    | string | The ID of the order, which can be stored in the database to credit the user|
| url        | string | The URL that can be opened by the user or put into an iframe              |

### Example Response
```json
{
    "orderId": "example_order_id",
    "url": "https://example.com/session_url"
}
```
    
## IPN Handler

Use the `verifyIpn` function to verify the request:


1. **Verify the IPN data:**

    ```javascript
    const data = req.body.data; // Or any other way you get the full data

    const isValidIpn = ""; // Generate the signature as above, and check if your signature matches the one sent in the request. 
    ```

2. **Extract the necessary data:**

    ```javascript
    const orderId = data?.orderId;
    const value = Number(data?.value || 0); // Value in cents
    ```

3. **Return the response:**

    ```javascript
    return res.status(200).send({
        success: true
    });
    ```

    > **Note:** You must return with `status 200` and `"success: true"` as a message. Otherwise, the same IPN call will be sent again.

## Credit the User

After receiving and verifying the IPN call:

1. **Match the `orderId` with your database.**
2. **Credit the user associated with that `orderId`.**

    > **Important:** The same IPN calls can be sent more than once. It is recommended to add a `credited` status or similar to the database to handle this.

---

This formatted documentation should help ensure clarity and ease of use for your service.
