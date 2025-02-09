function getSelectors(path) {
  return path
    .reverse()
    .filter((element) => element !== document && element !== window)
    .map((element) => {
      if (element.id) {
        return `${element.nodeName.toLowerCase()}#${element.id}`;
      }
      if (element.className) {
        return `${element.nodeName.toLowerCase()}.${element.className}`;
      }
      return element.nodeName.toLowerCase();
    })
    .join(' ');
}

export default function (pathsOrTarget) {
  if (Array.isArray(pathsOrTarget)) {
    return getSelectors(pathsOrTarget);
  } else {
    const path = [];
    while(pathsOrTarget) {
      path.push(pathsOrTarget);
      pathsOrTarget = pathsOrTarget.parentNode;
    }
    return getSelectors(path);
  }
}
