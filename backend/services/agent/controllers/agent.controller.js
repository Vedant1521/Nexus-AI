import redis from "../../../shared/redis/redis.js";
import { graph } from "../graph/supervisor.graph.js";
import { addMessage } from "../utils/memory.js";
import axios from "axios"

export const chat =
async(req,res,next)=>{

 try{

  const {

   prompt,

   conversationId,

   agent

} = req.body;

console.log(req.body)
console.log(req.file)

await addMessage(
 conversationId,
 "user",
 prompt
);

await axios.post(`${process.env.CHAT_SERVICE}/save-message`,{
  conversationId,
  role:"user",
  content:prompt
})







  const result =
  await graph.invoke({

   prompt,

   conversationId,

   userId:
   req.headers[
    "x-user-id"
   ],
   agent,
   file:req.file

  });


  console.log("after res",result)

  await addMessage(
 conversationId,
 "assistant",
 result.response
);
await axios.post(
 `${process.env.CHAT_SERVICE}/save-message`,
 {
  conversationId,
  role:"assistant",
  content:result.response,
  images:result.images,
  artifacts:
  result.artifacts || []
 }
)

  return res.json({

 success:true,

 answer:
 result.response,
 images:result.images,
 artifacts:
 result.artifacts || []

});

 }catch(error){

  next(error)

 }

}

import { uploadToS3 } from "../utils/uploadToS3.js";
import crypto from "crypto";

export const deploy = async (req, res, next) => {
  try {
    const { title, files } = req.body;
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files provided for deployment"
      });
    }

    const deployId = crypto.randomBytes(6).toString("hex");

    for (const file of files) {
      const buffer = Buffer.from(file.content, "utf-8");
      const path = `deploys/site-${deployId}/${file.name}`;
      
      let contentType = "text/plain";
      if (file.name.endsWith(".html")) contentType = "text/html";
      else if (file.name.endsWith(".css")) contentType = "text/css";
      else if (file.name.endsWith(".js")) contentType = "application/javascript";
      else if (file.name.endsWith(".json")) contentType = "application/json";
      else if (file.name.endsWith(".svg")) contentType = "image/svg+xml";

      await uploadToS3(buffer, path, contentType, "public-read");
    }

    const bucket = process.env.AWS_BUCKET_NAME;
    const region = process.env.AWS_REGION || "ap-south-1";
    const url = `https://${bucket}.s3.${region}.amazonaws.com/deploys/site-${deployId}/index.html`;

    return res.json({
      success: true,
      url,
      deployId
    });
  } catch (error) {
    next(error);
  }
};