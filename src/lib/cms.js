export function isSectionVisible(section) {
  return Boolean(section) && section.data?.visible !== false && section.data?.enabled !== false;
}

export function visibleSections(sections) {
  return (Array.isArray(sections) ? sections : []).filter(isSectionVisible);
}
