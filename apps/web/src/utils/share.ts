export async function performShare(
  shareData: ShareData,
): Promise<'shared' | 'copied'> {
  if (navigator.share) {
    await navigator.share(shareData);
    return 'shared';
  }
  await navigator.clipboard.writeText(
    `${shareData.title}\n\n${shareData.text}\n\nPlay at ${shareData.url}`,
  );
  return 'copied';
}
