export const isValidHeadingHierarchy = (
  headings: HTMLHeadingElement[]
): boolean => {
  const firstLevel =
    headings.length !== 0 ? parseInt(headings[0].tagName[1]) : 1;
  return headings.every((h, i) => {
    if (i === headings.length - 1) {
      return true;
    }

    const level = parseInt(h.tagName[1]);
    const nextLevel = parseInt(headings[i + 1].tagName[1]);
    if (firstLevel > nextLevel) {
      return false;
    }

    return nextLevel <= level + 1;
  });
};

export const generateTOC = <T extends Element>(
  container: T
): HTMLUListElement | string => {
  const headings = Array.from(
    container.querySelectorAll('h1,h2,h3,h4,h5,h6')
  ) as HTMLHeadingElement[];

  if (headings.length === 0) {
    console.warn('Empty container');
    return '';
  }

  if (!isValidHeadingHierarchy(headings)) {
    console.warn('Invalid heading hierarchy');
    return '';
  }

  const [ul, _] = generateLinkList(headings, 0);
  return ul;
};

export const generateLinkList = (
  headings: HTMLHeadingElement[],
  currentIndex: number
): [HTMLUListElement, number] => {
  const ul = document.createElement('ul');
  const currentLevel = parseInt(headings[currentIndex].tagName[1]);

  while (currentIndex < headings.length) {
    const heading = headings[currentIndex];
    const level = parseInt(heading.tagName[1]);

    if (level === currentLevel) {
      const li = document.createElement('li');
      const a = document.createElement('a');

      if (!heading.id || heading.id == '') {
        heading.id = `toc-${currentIndex}`;
      }
      a.href = `#${heading.id}`;
      a.textContent = heading.textContent || `Heading ${currentIndex}`;
      li.appendChild(a);
      ul.appendChild(li);
      currentIndex++;
    } else if (level > currentLevel) {
      const [nestedUl, updatedIndex] = generateLinkList(headings, currentIndex);
      ul.lastElementChild?.appendChild(nestedUl);
      currentIndex = updatedIndex;
    } else {
      break;
    }
  }

  return [ul, currentIndex];
};
