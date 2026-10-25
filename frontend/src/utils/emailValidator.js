export const DISPOSABLE_OR_FAKE_DOMAINS = new Set([
  'test.com',
  'example.com',
  'example.org',
  'example.net',
  'fake.com',
  'dummy.com',
  'asdf.com',
  'invalid.com',
  'sample.com',
  'temp.com',
  'nowhere.com',
  'none.com',
  'mailinator.com',
  'tempmail.com',
  'temp-mail.org',
  '10minutemail.com',
  'guerrillamail.com',
  'throwawaymail.com',
  'yopmail.com',
  'trashmail.com',
  'sharklasers.com',
  'getnada.com',
  'dispostable.com',
  'fakemailgenerator.com',
  'generator.email',
  'emailondeck.com',
  'maildrop.cc',
  'inboxkitten.com',
  'trashmail.net',
  'fakeinbox.com',
  'burnerdelivery.com',
  'nada.ltd',
]);

export const DOMAIN_TYPO_MAP = {
  'gmail': 'gmail.com',
  'gamil.com': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'gmal.com': 'gmail.com',
  'gmaill.com': 'gmail.com',
  'gmail.con': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gmail.cm': 'gmail.com',
  'gemail.com': 'gmail.com',
  'gmaild.com': 'gmail.com',
  'gmailc.com': 'gmail.com',
  'gamail.com': 'gmail.com',
  'yahoo': 'yahoo.com',
  'yaho.com': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'yaho.co': 'yahoo.com',
  'yahoo.con': 'yahoo.com',
  'yahu.com': 'yahoo.com',
  'hotmail': 'hotmail.com',
  'hotmial.com': 'hotmail.com',
  'hotmale.com': 'hotmail.com',
  'hotmai.com': 'hotmail.com',
  'hotmail.con': 'hotmail.com',
  'outlook': 'outlook.com',
  'outlok.com': 'outlook.com',
  'outloo.com': 'outlook.com',
  'outlook.con': 'outlook.com',
};

const DUMMY_LOCAL_PARTS = new Set([
  'asdfgh',
  '123456',
  'qwerty',
  'aaaaaa',
  '111111',
  'abcdef',
  'testing',
  'fakemail',
]);

/**
 * Validates whether an email string is realistic, properly formatted,
 * complies with provider standards (especially Google/Gmail), and is not disposable.
 *
 * @param {string} rawEmail - Email address to test.
 * @returns {{ isValid: boolean, error: string | null, suggestion?: string }}
 */
export function validateRealisticEmail(rawEmail) {
  if (typeof rawEmail !== 'string') {
    return { isValid: false, error: 'Email address must be a valid text string.' };
  }

  const email = rawEmail.trim();

  if (!email) {
    return { isValid: false, error: 'Email address is required.' };
  }

  if (email.length > 254) {
    return { isValid: false, error: 'Email address is too long (maximum 254 characters).' };
  }

  if (/\s/.test(email)) {
    return { isValid: false, error: 'Email address cannot contain spaces.' };
  }

  if (!email.includes('@')) {
    return { isValid: false, error: 'Please enter a complete email address including domain (@gmail.com).' };
  }

  const parts = email.split('@');
  if (parts.length !== 2) {
    return { isValid: false, error: 'Email address cannot contain more than one "@" symbol.' };
  }

  const [localPart, domainPart] = parts;
  const domain = domainPart.toLowerCase();

  if (!localPart) {
    return { isValid: false, error: 'Email address is missing the username before "@".' };
  }

  if (localPart.length < 2) {
    return { isValid: false, error: 'Email username must be at least 2 characters long.' };
  }

  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return { isValid: false, error: 'Email username cannot start or end with a period.' };
  }

  if (/\.\./.test(localPart)) {
    return { isValid: false, error: 'Email address cannot contain consecutive periods.' };
  }

  if (DUMMY_LOCAL_PARTS.has(localPart.toLowerCase())) {
    return { isValid: false, error: 'Please enter a realistic email address.' };
  }

  if (!domain) {
    return { isValid: false, error: 'Email address is missing a domain after "@" (gmail.com).' };
  }

  // Check known provider typos
  if (DOMAIN_TYPO_MAP[domain]) {
    const intendedDomain = DOMAIN_TYPO_MAP[domain];
    return {
      isValid: false,
      error: `Invalid email domain. Did you mean @${intendedDomain}?`,
      suggestion: `${localPart}@${intendedDomain}`,
    };
  }

  if (!domain.includes('.')) {
    return { isValid: false, error: 'Please include a valid top-level domain (.com or .ph).' };
  }

  // Reject disposable or known fake domains
  if (DISPOSABLE_OR_FAKE_DOMAINS.has(domain)) {
    return { isValid: false, error: 'Disposable or test email addresses are not allowed. Please enter an active, realistic email.' };
  }

  const domainSegments = domain.split('.');
  const tld = domainSegments[domainSegments.length - 1];

  // TLD must be purely alphabetical and between 2 and 24 characters
  if (!/^[a-zA-Z]{2,24}$/.test(tld)) {
    return { isValid: false, error: 'Email top-level domain extension must contain(.com).' };
  }

  // Verify all domain segments are valid RFC host labels
  const invalidSegment = domainSegments.some((seg) => !seg || !/^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(seg));
  if (invalidSegment) {
    return { isValid: false, error: 'Email domain contains invalid characters or formatting.' };
  }

  // Google / Gmail specific verification
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    const baseUsername = localPart.split('+')[0];

    // Gmail usernames must be between 6 and 30 characters
    if (baseUsername.length < 6) {
      return { isValid: false, error: 'Gmail usernames must be at least 6 characters long.' };
    }
    if (baseUsername.length > 30) {
      return { isValid: false, error: 'Gmail usernames cannot exceed 30 characters.' };
    }

    // Gmail usernames can only contain letters, numbers, and periods
    if (!/^[a-zA-Z0-9.]+$/.test(baseUsername)) {
      return { isValid: false, error: 'Gmail usernames may only contain letters, numbers, and periods.' };
    }
  }

  // Standard general RFC-compliant pattern
  const generalEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!generalEmailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid, realistic email address.' };
  }

  return { isValid: true, error: null };
}

export default validateRealisticEmail;
