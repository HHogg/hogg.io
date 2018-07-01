export const onCompleteAll = (tweens) =>
  Promise.all(tweens.filter((_) => _).map((tween) =>
    new Promise((resolve) => tween.onComplete(resolve).start())
  ));
