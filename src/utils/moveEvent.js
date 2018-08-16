export default (event) => event.touches ? ({
  clientX: event.touches[0].clientX,
  clientY: event.touches[0].clientY,
  target: event.target,
}) : ({
  clientX: event.clientX,
  clientY: event.clientY,
  target: event.target,
});
