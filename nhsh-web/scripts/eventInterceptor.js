//事件攔截器
const EventInterceptor = function (e) { e ? e.stopPropagation() : window.event.cancelBubble = true; }
