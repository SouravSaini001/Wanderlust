const crypto = require("crypto");

const algorithm = "aes-256-cbc";

const key = crypto
    .createHash("sha256")
    .update(process.env.SECRET)
    .digest();

const encrypt = (text) => {

    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(
        algorithm,
        key,
        iv
    );

    let encrypted = cipher.update(
        text,
        "utf8",
        "hex"
    );

    encrypted += cipher.final("hex");

    return {
        encrypted,
        iv: iv.toString("hex")
    };
};


const decrypt = (encrypted, iv) => {

    const decipher = crypto.createDecipheriv(
        algorithm,
        key,
        Buffer.from(iv, "hex")
    );

    let decrypted = decipher.update(
        encrypted,
        "hex",
        "utf8"
    );

    decrypted += decipher.final("utf8");

    return decrypted;
};


module.exports = {
    encrypt,
    decrypt
};