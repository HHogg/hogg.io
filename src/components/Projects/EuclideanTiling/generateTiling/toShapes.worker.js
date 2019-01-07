import toShapes from './toShapes';

onmessage = (({ data }) => {
  try {
    postMessage(toShapes(data));
  } catch (e) {
    postMessage({ error: e });
  }
});
