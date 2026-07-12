import { createSlice } from '@reduxjs/toolkit'


const initialState = {
   conversations:[],
  selectedConversation:null
}

export const conversationSlice = createSlice({
  name: 'conversation',
  initialState,
  reducers: {
     setConversations:(state,action)=>{
   state.conversations=action.payload;

  },

  addConversation:(state,action)=>{

   state.conversations.unshift(action.payload);

  },

  setSelectedConversation: (state,action)=>{

   state.selectedConversation =action.payload;

  },
removeConversation:(state,action)=>{
  const conversationId = action.payload;
  state.conversations = state.conversations.filter(conv => conv._id !== conversationId);
  if (state.selectedConversation?._id === conversationId) {
    state.selectedConversation = null;
  }
},
updateConversationState:(state,action)=>{
  const { conversationId, title, isPinned } = action.payload;
  state.conversations = state.conversations.map((conv) => {
    if (conv._id === conversationId) {
      const updated = { ...conv };
      if (title !== undefined) updated.title = title;
      if (isPinned !== undefined) updated.isPinned = isPinned;
      return updated;
    }
    return conv;
  });

  // Sort: pinned first, then newest first
  state.conversations.sort((a, b) => {
    const aPin = a.isPinned ? 1 : 0;
    const bPin = b.isPinned ? 1 : 0;
    if (aPin !== bPin) return bPin - aPin;
    return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
  });

  if (state.selectedConversation?._id === conversationId) {
    const updatedSelected = { ...state.selectedConversation };
    if (title !== undefined) updatedSelected.title = title;
    if (isPinned !== undefined) updatedSelected.isPinned = isPinned;
    state.selectedConversation = updatedSelected;
  }
}

 
  },
})

// Action creators are generated for each case reducer function
export const {setConversations,addConversation,setSelectedConversation,removeConversation,updateConversationState} = conversationSlice.actions

export default conversationSlice.reducer