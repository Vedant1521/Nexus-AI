import api from "../utils/axios";


export const getConversations =async()=>{

 const response =await api.get( "/api/chat/get-conversations"
 );

 return response.data;

};
export const updateConversations =async(conversationId,title,isPinned)=>{

 const response =await api.post( "/api/chat/update-conversation",{
    conversationId,title,isPinned
 }
 );

 return response.data;

};

export const deleteConversationApi =async(conversationId)=>{

 const response =await api.post( "/api/chat/delete-conversation",{
    conversationId
 }
 );

 return response.data;

};

export const createConversation =async()=>{

 const response =await api.post("/api/chat/create-conversation",{});

 return response.data;

};