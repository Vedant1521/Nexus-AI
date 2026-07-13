import { createSlice } from '@reduxjs/toolkit'


const initialState = {
   messages:[],
   isLoading:false,
   artifacts:[]
}

export const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
   setMessages:(state,action)=>{

   state.messages =action.payload;

   },

   addMessage:(state,action)=>{

   state.messages.push(action.payload);

   },
   setIsLoading:(state,action)=>{

   state.isLoading=action.payload;

   },
   setArtifacts: (state, action) => {
   state.artifacts = action.payload;
 },
   removeMessage: (state, action) => {
   state.messages = state.messages.filter(m => m._id !== action.payload);
 },
   updateMessage: (state, action) => {
   const { index, content, images, artifacts } = action.payload;
   const msg = state.messages[index];
   if (msg) {
     if (content !== undefined) msg.content = content;
     if (images !== undefined) msg.images = images;
     if (artifacts !== undefined) msg.artifacts = artifacts;
   }
 }
  
  },
})

export const {setMessages,addMessage,setIsLoading,setArtifacts,removeMessage,updateMessage} = messageSlice.actions

export default messageSlice.reducer