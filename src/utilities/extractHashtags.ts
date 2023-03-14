const hashtagRegex = /(^|\B)#(?![0-9_]+\b)([a-zA-Z0-9]{1,15})(\b|\r)/g;

export const extractHashtags = (desc: string): string[] | null | undefined => {
    const hashtags = desc.match(hashtagRegex);
    return hashtags?.map((hashtag) => hashtag.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '').toLowerCase());
};
