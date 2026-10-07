// Local prototype event names; production event mappings belong to the API handoff.
export const communityTaskTypes = [
  {value:'circle.view',label:'浏览圈子',route:'circles'},
  {value:'circle.post.publish',label:'圈内发帖',route:'circles'},
  {value:'circle.post.like',label:'点赞圈内帖子',route:'circles'},
  {value:'circle.post.share',label:'转发圈内帖子',route:'circles'},
  {value:'circle.post.favorite',label:'收藏圈内帖子',route:'circles'},
  {value:'app.view',label:'浏览AI应用',route:'apps'},
  {value:'app.use',label:'使用AI应用',route:'apps'},
  {value:'app.like',label:'点赞AI应用',route:'apps'},
  {value:'app.share',label:'转发AI应用',route:'apps'},
  {value:'app.favorite',label:'收藏AI应用',route:'apps'},
  {value:'topic.view',label:'浏览专题',route:'topics'},
];
