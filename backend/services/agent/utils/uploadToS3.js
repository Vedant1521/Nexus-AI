import { PutObjectCommand }
from "@aws-sdk/client-s3";

import { s3 }
from "./s3.js";

export const uploadToS3 =
async (
  buffer,
  fileName,
  contentType,
  acl
) => {

  const params = {
    Bucket:
      process.env.AWS_BUCKET_NAME,

    Key:
      fileName,

    Body:
      buffer,

    ContentType:
      contentType
  };

  if (acl) {
    params.ACL = acl;
  }

  await s3.send(
    new PutObjectCommand(params)
  );

  return fileName;
};