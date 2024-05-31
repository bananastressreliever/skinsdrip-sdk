# SkinsDrip SDK Documentation

## How to Install

1. **Create a `.npmrc` file** in the same directory as your `package.json` file.  
   The contents of the `.npmrc` file should be as follows. Make sure to change `YOUR_PAT_TOKEN_HERE` to your actual key:

    ```text
    @bananastressreliever:registry=https://npm.pkg.github.com
    //npm.pkg.github.com/:_authToken=YOUR_PAT_TOKEN_HERE
    ```

2. **Install the package** using npm:

    ```bash
    npm install @bananastressreliever/skinsdrip-sdk
    ```

## How to Import

### If you're using a module-based system (`type = module` in your `package.json` file):

```javascript
import skinsdripSDK from '@bananastressreliever/skinsdrip-sdk';
```

### Otherwise:

```javascript
const skinsdripSDK = require('@bananastressreliever/skinsdrip-sdk').default;
```

## Initialization

Initialize the SDK with your merchant credentials:

```javascript
this.skinsdrip = new skinsdripSDK(SKINSDRIP_MERCHANT, SKINSDRIP_SECRET);

// Must run this command before making any other calls
await this.skinsdrip.authenticate();
```

## Creating an Order and Generating URL for iFrame

1. **Create a pay session and get the checkout URL:**

    ```javascript
    const checkoutUrlRes = await this.skinsdrip.getPaySession(userId);

    const url = checkoutUrlRes.data.url;
    const orderId = checkoutUrlRes.data.orderId;
    ```

2. **Use the URL to set the iframe on the frontend.**

3. **Store the `orderId` alongside your `userId` in your database.**  
   You will need to use this `orderId` when crediting the user upon receiving the IPN call.

## IPN Handler

Use the `verifyIpn` function to verify the request:

1. **Import the function:**

    ```javascript
    import skinsdripSDK, { verifyIpn } from '@bananastressreliever/skinsdrip-sdk';
    ```

2. **Verify the IPN data:**

    ```javascript
    const data = req.body.data; // Or any other way you get the full data

    const isValidIpn = verifyIpn(data, process.env.SKINSDRIP_SECRET);
    ```

3. **Extract the necessary data:**

    ```javascript
    const orderId = data?.orderId;
    const value = Number(data?.value || 0); // Value in cents
    ```

4. **Return the response:**

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
