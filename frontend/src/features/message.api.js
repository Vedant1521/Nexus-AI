import api from "../utils/axios";


export const getMessages =async(conversationId)=>{

 const { data } =await api.get(`/api/chat/get-messages/${conversationId}`);
 console.log(data)
 return data;

};

export const saveMessageApi = async (messageData) => {
  const { data } = await api.post("/api/chat/save-message", messageData);
  return data;
};