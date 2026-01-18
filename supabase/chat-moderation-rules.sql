-- =====================================================
-- COMPREHENSIVE CHAT MODERATION RULES
-- Auto-moderation for sports fan community
-- =====================================================

-- Clear existing rules (optional - comment out if appending)
-- DELETE FROM chat_moderation_rules;

-- =====================================================
-- PROFANITY FILTERS (Category: profanity)
-- =====================================================

-- Severe profanity - immediate block
INSERT INTO chat_moderation_rules (rule_type, category, pattern, severity, action, description) VALUES
-- F-word variations
('word_filter', 'profanity', 'fuck', 'critical', 'block', 'F-word base'),
('word_filter', 'profanity', 'f*ck', 'critical', 'block', 'F-word censored variation'),
('word_filter', 'profanity', 'f**k', 'critical', 'block', 'F-word censored variation'),
('word_filter', 'profanity', 'fck', 'critical', 'block', 'F-word no vowel'),
('word_filter', 'profanity', 'fuk', 'critical', 'block', 'F-word phonetic'),
('word_filter', 'profanity', 'fuq', 'critical', 'block', 'F-word phonetic'),
('word_filter', 'profanity', 'phuck', 'critical', 'block', 'F-word phonetic'),
('word_filter', 'profanity', 'phuk', 'critical', 'block', 'F-word phonetic'),
('regex', 'profanity', 'f+u+c+k+', 'critical', 'block', is_regex := true, 'F-word extended'),
('regex', 'profanity', 'f[\W_]*u[\W_]*c[\W_]*k', 'critical', 'block', is_regex := true, 'F-word with separators'),

-- S-word variations
('word_filter', 'profanity', 'shit', 'high', 'block', 'S-word base'),
('word_filter', 'profanity', 'sh*t', 'high', 'block', 'S-word censored'),
('word_filter', 'profanity', 'sh1t', 'high', 'block', 'S-word leet'),
('word_filter', 'profanity', 'sht', 'high', 'block', 'S-word no vowel'),
('word_filter', 'profanity', 'shyt', 'high', 'block', 'S-word phonetic'),

-- A-word variations
('word_filter', 'profanity', 'asshole', 'high', 'block', 'A-word compound'),
('word_filter', 'profanity', 'a$$hole', 'high', 'block', 'A-word symbol'),
('word_filter', 'profanity', 'a**hole', 'high', 'block', 'A-word censored'),

-- B-word variations
('word_filter', 'profanity', 'bitch', 'high', 'block', 'B-word base'),
('word_filter', 'profanity', 'b*tch', 'high', 'block', 'B-word censored'),
('word_filter', 'profanity', 'b1tch', 'high', 'block', 'B-word leet'),
('word_filter', 'profanity', 'biatch', 'high', 'block', 'B-word phonetic'),

-- C-word (severe)
('word_filter', 'profanity', 'cunt', 'critical', 'block', 'C-word base'),
('word_filter', 'profanity', 'c*nt', 'critical', 'block', 'C-word censored'),

-- D-word variations
('word_filter', 'profanity', 'dick', 'medium', 'block', 'D-word base'),
('word_filter', 'profanity', 'd*ck', 'medium', 'block', 'D-word censored'),
('word_filter', 'profanity', 'cock', 'high', 'block', 'C-word anatomy'),
('word_filter', 'profanity', 'c*ck', 'high', 'block', 'C-word censored'),

-- P-word variations
('word_filter', 'profanity', 'pussy', 'high', 'block', 'P-word base'),
('word_filter', 'profanity', 'puss', 'medium', 'block', 'P-word short'),

-- Other profanity
('word_filter', 'profanity', 'damn', 'low', 'warn', 'Mild profanity'),
('word_filter', 'profanity', 'crap', 'low', 'warn', 'Mild profanity'),
('word_filter', 'profanity', 'bastard', 'medium', 'block', 'Profanity'),
('word_filter', 'profanity', 'piss', 'low', 'warn', 'Mild profanity'),
('word_filter', 'profanity', 'whore', 'high', 'block', 'Profanity'),
('word_filter', 'profanity', 'slut', 'high', 'block', 'Profanity'),
('word_filter', 'profanity', 'dildo', 'high', 'block', 'Adult content'),
('word_filter', 'profanity', 'penis', 'medium', 'block', 'Anatomy'),
('word_filter', 'profanity', 'vagina', 'medium', 'block', 'Anatomy'),
('word_filter', 'profanity', 'tits', 'medium', 'block', 'Anatomy'),
('word_filter', 'profanity', 'boobs', 'medium', 'block', 'Anatomy');

-- =====================================================
-- HATE SPEECH FILTERS (Category: hate_speech)
-- =====================================================

INSERT INTO chat_moderation_rules (rule_type, category, pattern, severity, action, description) VALUES
-- Racial slurs
('word_filter', 'hate_speech', 'nigger', 'critical', 'ban', 'Racial slur - N-word'),
('word_filter', 'hate_speech', 'nigga', 'critical', 'ban', 'Racial slur variant'),
('word_filter', 'hate_speech', 'n*gger', 'critical', 'ban', 'Racial slur censored'),
('word_filter', 'hate_speech', 'n1gger', 'critical', 'ban', 'Racial slur leet'),
('regex', 'hate_speech', 'n+[i1]+g+[e3]*r*', 'critical', 'ban', is_regex := true, 'N-word variations'),
('word_filter', 'hate_speech', 'negro', 'critical', 'ban', 'Racial term'),
('word_filter', 'hate_speech', 'coon', 'critical', 'ban', 'Racial slur'),
('word_filter', 'hate_speech', 'spic', 'critical', 'ban', 'Ethnic slur'),
('word_filter', 'hate_speech', 'wetback', 'critical', 'ban', 'Ethnic slur'),
('word_filter', 'hate_speech', 'beaner', 'critical', 'ban', 'Ethnic slur'),
('word_filter', 'hate_speech', 'chink', 'critical', 'ban', 'Ethnic slur'),
('word_filter', 'hate_speech', 'gook', 'critical', 'ban', 'Ethnic slur'),
('word_filter', 'hate_speech', 'kike', 'critical', 'ban', 'Antisemitic slur'),
('word_filter', 'hate_speech', 'heeb', 'critical', 'ban', 'Antisemitic slur'),
('word_filter', 'hate_speech', 'raghead', 'critical', 'ban', 'Ethnic slur'),
('word_filter', 'hate_speech', 'towelhead', 'critical', 'ban', 'Ethnic slur'),
('word_filter', 'hate_speech', 'camel jockey', 'critical', 'ban', 'Ethnic slur'),
('word_filter', 'hate_speech', 'sand nigger', 'critical', 'ban', 'Ethnic slur'),
('word_filter', 'hate_speech', 'cracker', 'high', 'block', 'Racial term'),
('word_filter', 'hate_speech', 'honky', 'high', 'block', 'Racial term'),
('word_filter', 'hate_speech', 'gringo', 'medium', 'block', 'Ethnic term'),

-- LGBTQ+ slurs
('word_filter', 'hate_speech', 'faggot', 'critical', 'ban', 'Homophobic slur'),
('word_filter', 'hate_speech', 'fag', 'critical', 'ban', 'Homophobic slur'),
('word_filter', 'hate_speech', 'f*g', 'critical', 'ban', 'Homophobic slur censored'),
('word_filter', 'hate_speech', 'f4g', 'critical', 'ban', 'Homophobic slur leet'),
('word_filter', 'hate_speech', 'dyke', 'critical', 'ban', 'Homophobic slur'),
('word_filter', 'hate_speech', 'tranny', 'critical', 'ban', 'Transphobic slur'),
('word_filter', 'hate_speech', 'shemale', 'critical', 'ban', 'Transphobic term'),
('word_filter', 'hate_speech', 'homo', 'high', 'block', 'Homophobic term'),
('word_filter', 'hate_speech', 'queer', 'medium', 'warn', 'Context-dependent'),

-- Disability slurs
('word_filter', 'hate_speech', 'retard', 'critical', 'ban', 'Ableist slur'),
('word_filter', 'hate_speech', 'retarded', 'critical', 'ban', 'Ableist slur'),
('word_filter', 'hate_speech', 'tard', 'high', 'block', 'Ableist slur'),
('word_filter', 'hate_speech', 'cripple', 'high', 'block', 'Ableist term'),
('word_filter', 'hate_speech', 'spaz', 'high', 'block', 'Ableist slur'),

-- Hate group terminology
('word_filter', 'hate_speech', 'nazi', 'high', 'block', 'Hate group reference'),
('word_filter', 'hate_speech', 'heil hitler', 'critical', 'ban', 'Nazi salute'),
('word_filter', 'hate_speech', '1488', 'critical', 'ban', 'White supremacist code'),
('word_filter', 'hate_speech', 'white power', 'critical', 'ban', 'White supremacist'),
('word_filter', 'hate_speech', 'white pride', 'critical', 'ban', 'White supremacist'),
('word_filter', 'hate_speech', 'kkk', 'critical', 'ban', 'Hate group'),
('word_filter', 'hate_speech', 'ku klux', 'critical', 'ban', 'Hate group'),

-- General hate phrases
('word_filter', 'hate_speech', 'go back to your country', 'critical', 'ban', 'Xenophobic'),
('word_filter', 'hate_speech', 'speak english', 'high', 'block', 'Xenophobic demand'),
('word_filter', 'hate_speech', 'subhuman', 'critical', 'ban', 'Dehumanizing');

-- =====================================================
-- VIOLENCE & THREATS (Category: violence)
-- =====================================================

INSERT INTO chat_moderation_rules (rule_type, category, pattern, severity, action, description) VALUES
-- Direct threats
('regex', 'violence', 'i.*(will|gonna|going to).*kill', 'critical', 'ban', is_regex := true, 'Death threat'),
('regex', 'violence', 'kill.*your(self|selves)', 'critical', 'ban', is_regex := true, 'Suicide encouragement'),
('word_filter', 'violence', 'kys', 'critical', 'ban', 'Kill yourself acronym'),
('word_filter', 'violence', 'kill yourself', 'critical', 'ban', 'Suicide encouragement'),
('regex', 'violence', 'i.*(will|gonna).*shoot', 'critical', 'ban', is_regex := true, 'Shooting threat'),
('regex', 'violence', 'i.*(will|gonna).*stab', 'critical', 'ban', is_regex := true, 'Violence threat'),
('regex', 'violence', 'i.*(will|gonna).*beat', 'high', 'block', is_regex := true, 'Violence threat'),
('regex', 'violence', 'i.*(will|gonna).*hurt', 'high', 'block', is_regex := true, 'Violence threat'),
('word_filter', 'violence', 'i will find you', 'critical', 'ban', 'Stalking threat'),
('regex', 'violence', 'know where you live', 'critical', 'ban', is_regex := true, 'Stalking threat'),

-- Violence words
('word_filter', 'violence', 'murder', 'high', 'block', 'Violence word'),
('word_filter', 'violence', 'rape', 'critical', 'ban', 'Sexual violence'),
('word_filter', 'violence', 'terrorist', 'high', 'block', 'Violence association'),
('word_filter', 'violence', 'bomb threat', 'critical', 'ban', 'Terrorism'),
('word_filter', 'violence', 'school shooting', 'critical', 'ban', 'Violence reference'),
('word_filter', 'violence', 'mass shooting', 'critical', 'ban', 'Violence reference'),

-- Self-harm
('word_filter', 'violence', 'cut myself', 'critical', 'block', 'Self-harm'),
('word_filter', 'violence', 'suicide', 'high', 'block', 'Self-harm reference'),
('word_filter', 'violence', 'hang myself', 'critical', 'block', 'Self-harm');

-- =====================================================
-- SPAM PATTERNS (Category: spam)
-- =====================================================

INSERT INTO chat_moderation_rules (rule_type, category, pattern, severity, action, description) VALUES
-- Repetition
('regex', 'spam', '(.)\1{5,}', 'medium', 'block', is_regex := true, 'Character spam (aaaaa)'),
('regex', 'spam', '(\b\w+\b)(\s+\1){3,}', 'medium', 'block', is_regex := true, 'Word repetition'),
('regex', 'spam', '^[A-Z\s!?]{20,}$', 'low', 'warn', is_regex := true, 'All caps message'),

-- Crypto/financial spam
('word_filter', 'spam', 'bitcoin', 'medium', 'block', 'Crypto spam'),
('word_filter', 'spam', 'ethereum', 'medium', 'block', 'Crypto spam'),
('word_filter', 'spam', 'crypto', 'low', 'warn', 'Potential crypto spam'),
('word_filter', 'spam', 'nft', 'low', 'warn', 'Potential NFT spam'),
('word_filter', 'spam', 'forex', 'high', 'block', 'Financial spam'),
('word_filter', 'spam', 'invest now', 'high', 'block', 'Investment spam'),
('word_filter', 'spam', 'make money fast', 'high', 'block', 'Money spam'),
('word_filter', 'spam', 'get rich', 'medium', 'block', 'Money spam'),
('word_filter', 'spam', 'passive income', 'medium', 'block', 'Money spam'),
('word_filter', 'spam', 'work from home', 'low', 'warn', 'Potential spam'),
('regex', 'spam', 'earn.*\$.*per', 'high', 'block', is_regex := true, 'Earnings spam'),
('regex', 'spam', '\$\d{3,}.*day', 'high', 'block', is_regex := true, 'Money spam pattern'),

-- Dating/adult spam
('word_filter', 'spam', 'hot singles', 'high', 'block', 'Dating spam'),
('word_filter', 'spam', 'onlyfans', 'high', 'block', 'Adult content promotion'),
('word_filter', 'spam', 'fansly', 'high', 'block', 'Adult content promotion'),
('word_filter', 'spam', 'cam girl', 'high', 'block', 'Adult spam'),
('word_filter', 'spam', 'hookup', 'medium', 'block', 'Dating spam'),
('word_filter', 'spam', 'sugar daddy', 'high', 'block', 'Dating spam'),
('word_filter', 'spam', 'sugar mommy', 'high', 'block', 'Dating spam'),

-- Bot patterns
('regex', 'spam', 'dm me for', 'medium', 'block', is_regex := true, 'DM solicitation'),
('regex', 'spam', 'check.*bio', 'medium', 'block', is_regex := true, 'Bio spam'),
('regex', 'spam', 'link in.*bio', 'medium', 'block', is_regex := true, 'Bio link spam'),
('regex', 'spam', 'follow.*for.*follow', 'low', 'warn', is_regex := true, 'Follow spam');

-- =====================================================
-- SALES & MARKETING (Category: sales)
-- =====================================================

INSERT INTO chat_moderation_rules (rule_type, category, pattern, severity, action, description) VALUES
-- Direct sales
('word_filter', 'sales', 'buy now', 'high', 'block', 'Sales pitch'),
('word_filter', 'sales', 'order now', 'high', 'block', 'Sales pitch'),
('word_filter', 'sales', 'limited time', 'medium', 'block', 'Sales urgency'),
('word_filter', 'sales', 'act now', 'medium', 'block', 'Sales urgency'),
('word_filter', 'sales', 'special offer', 'medium', 'block', 'Sales pitch'),
('word_filter', 'sales', 'discount code', 'medium', 'block', 'Sales pitch'),
('word_filter', 'sales', 'promo code', 'medium', 'block', 'Sales pitch'),
('word_filter', 'sales', 'use code', 'medium', 'block', 'Sales pitch'),
('word_filter', 'sales', 'coupon', 'low', 'warn', 'Potential sales'),
('regex', 'sales', '\d+%\s*off', 'medium', 'block', is_regex := true, 'Discount promotion'),
('word_filter', 'sales', 'free shipping', 'medium', 'block', 'Sales pitch'),
('word_filter', 'sales', 'click here', 'medium', 'block', 'Clickbait'),
('word_filter', 'sales', 'check out my', 'low', 'warn', 'Self-promotion'),
('word_filter', 'sales', 'visit my website', 'medium', 'block', 'Self-promotion'),
('word_filter', 'sales', 'subscribe to', 'low', 'warn', 'Promotion'),
('word_filter', 'sales', 'giveaway', 'low', 'warn', 'Potential promotion'),

-- MLM/Pyramid schemes
('word_filter', 'sales', 'mlm', 'high', 'block', 'MLM spam'),
('word_filter', 'sales', 'network marketing', 'high', 'block', 'MLM spam'),
('word_filter', 'sales', 'be your own boss', 'high', 'block', 'MLM spam'),
('word_filter', 'sales', 'financial freedom', 'medium', 'block', 'MLM spam'),
('word_filter', 'sales', 'side hustle', 'low', 'warn', 'Potential promotion'),

-- Betting/gambling
('word_filter', 'sales', 'bet365', 'high', 'block', 'Gambling promotion'),
('word_filter', 'sales', 'draftkings', 'medium', 'block', 'Gambling promotion'),
('word_filter', 'sales', 'fanduel', 'medium', 'block', 'Gambling promotion'),
('word_filter', 'sales', 'sportsbook', 'medium', 'block', 'Gambling promotion'),
('word_filter', 'sales', 'free bet', 'high', 'block', 'Gambling promotion'),
('word_filter', 'sales', 'betting tips', 'high', 'block', 'Gambling promotion'),
('regex', 'sales', 'guaranteed.*win', 'high', 'block', is_regex := true, 'Gambling scam');

-- =====================================================
-- LINK FILTERING (Category: links)
-- =====================================================

INSERT INTO chat_moderation_rules (rule_type, category, pattern, severity, action, description) VALUES
-- URL patterns
('regex', 'links', 'https?://[^\s]+', 'low', 'warn', is_regex := true, 'Contains URL'),
('regex', 'links', 'www\.[^\s]+', 'low', 'warn', is_regex := true, 'Contains www URL'),
('regex', 'links', '\.[a-z]{2,4}/[^\s]*', 'low', 'warn', is_regex := true, 'Partial URL pattern'),

-- Suspicious TLDs
('regex', 'links', '\.(ru|cn|tk|ml|ga|cf)/[^\s]*', 'high', 'block', is_regex := true, 'Suspicious TLD'),

-- URL shorteners
('word_filter', 'links', 'bit.ly', 'medium', 'block', 'URL shortener'),
('word_filter', 'links', 'tinyurl', 'medium', 'block', 'URL shortener'),
('word_filter', 'links', 't.co', 'medium', 'block', 'URL shortener'),
('word_filter', 'links', 'goo.gl', 'medium', 'block', 'URL shortener'),
('word_filter', 'links', 'ow.ly', 'medium', 'block', 'URL shortener'),
('word_filter', 'links', 'is.gd', 'medium', 'block', 'URL shortener'),
('word_filter', 'links', 'buff.ly', 'medium', 'block', 'URL shortener'),

-- Allowed sports links (whitelist - action: allow)
('word_filter', 'links', 'espn.com', 'low', 'allow', 'Allowed sports site'),
('word_filter', 'links', 'nfl.com', 'low', 'allow', 'Allowed sports site'),
('word_filter', 'links', 'mlb.com', 'low', 'allow', 'Allowed sports site'),
('word_filter', 'links', 'nba.com', 'low', 'allow', 'Allowed sports site'),
('word_filter', 'links', 'nhl.com', 'low', 'allow', 'Allowed sports site'),
('word_filter', 'links', 'chicagobears.com', 'low', 'allow', 'Allowed team site'),
('word_filter', 'links', 'mlb.com/cubs', 'low', 'allow', 'Allowed team site'),
('word_filter', 'links', 'nba.com/bulls', 'low', 'allow', 'Allowed team site'),
('word_filter', 'links', 'youtube.com', 'low', 'warn', 'YouTube - review'),
('word_filter', 'links', 'twitter.com', 'low', 'warn', 'Twitter - review'),
('word_filter', 'links', 'x.com', 'low', 'warn', 'X - review');

-- =====================================================
-- HARASSMENT PATTERNS (Category: harassment)
-- =====================================================

INSERT INTO chat_moderation_rules (rule_type, category, pattern, severity, action, description) VALUES
-- Personal attacks
('word_filter', 'harassment', 'loser', 'low', 'warn', 'Name calling'),
('word_filter', 'harassment', 'idiot', 'medium', 'block', 'Name calling'),
('word_filter', 'harassment', 'moron', 'medium', 'block', 'Name calling'),
('word_filter', 'harassment', 'stupid', 'low', 'warn', 'Insult'),
('word_filter', 'harassment', 'dumb', 'low', 'warn', 'Insult'),
('word_filter', 'harassment', 'pathetic', 'low', 'warn', 'Insult'),
('word_filter', 'harassment', 'trash', 'low', 'warn', 'Context-dependent insult'),
('word_filter', 'harassment', 'garbage', 'low', 'warn', 'Context-dependent insult'),
('word_filter', 'harassment', 'worthless', 'medium', 'block', 'Severe insult'),
('word_filter', 'harassment', 'shut up', 'low', 'warn', 'Dismissive'),
('word_filter', 'harassment', 'stfu', 'medium', 'block', 'Profane dismissive'),
('word_filter', 'harassment', 'gtfo', 'medium', 'block', 'Profane dismissive'),
('word_filter', 'harassment', 'kys', 'critical', 'ban', 'Kill yourself'),
('word_filter', 'harassment', 'neck yourself', 'critical', 'ban', 'Suicide encouragement'),
('word_filter', 'harassment', 'go die', 'critical', 'ban', 'Death wish'),
('regex', 'harassment', 'nobody.*asked', 'low', 'warn', is_regex := true, 'Dismissive'),
('regex', 'harassment', 'who.*asked', 'low', 'warn', is_regex := true, 'Dismissive'),

-- Doxxing attempts
('regex', 'harassment', '\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', 'critical', 'ban', is_regex := true, 'Phone number'),
('regex', 'harassment', '\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', 'high', 'block', is_regex := true, 'Email address'),
('regex', 'harassment', '\b\d{1,5}\s+\w+\s+(st|street|ave|avenue|blvd|boulevard|rd|road|dr|drive)\b', 'critical', 'ban', is_regex := true, case_sensitive := false, 'Street address'),
('regex', 'harassment', '\b\d{5}(-\d{4})?\b', 'medium', 'warn', is_regex := true, 'Zip code'),

-- Trolling
('regex', 'harassment', 'cope\s*(and\s*seethe)?', 'low', 'warn', is_regex := true, 'Trolling phrase'),
('word_filter', 'harassment', 'ratio', 'low', 'warn', 'Trolling'),
('word_filter', 'harassment', 'didnt ask', 'low', 'warn', 'Trolling'),
('word_filter', 'harassment', 'touch grass', 'low', 'warn', 'Trolling'),
('word_filter', 'harassment', 'skill issue', 'low', 'warn', 'Trolling');

-- =====================================================
-- INAPPROPRIATE CONTENT (Category: inappropriate)
-- =====================================================

INSERT INTO chat_moderation_rules (rule_type, category, pattern, severity, action, description) VALUES
-- Drug references
('word_filter', 'inappropriate', 'weed', 'low', 'warn', 'Drug reference'),
('word_filter', 'inappropriate', 'marijuana', 'low', 'warn', 'Drug reference'),
('word_filter', 'inappropriate', 'cocaine', 'medium', 'block', 'Drug reference'),
('word_filter', 'inappropriate', 'heroin', 'medium', 'block', 'Drug reference'),
('word_filter', 'inappropriate', 'meth', 'medium', 'block', 'Drug reference'),
('word_filter', 'inappropriate', 'lsd', 'medium', 'block', 'Drug reference'),
('word_filter', 'inappropriate', 'ecstasy', 'medium', 'block', 'Drug reference'),
('word_filter', 'inappropriate', 'mdma', 'medium', 'block', 'Drug reference'),
('word_filter', 'inappropriate', 'fentanyl', 'high', 'block', 'Drug reference'),
('word_filter', 'inappropriate', 'drug dealer', 'high', 'block', 'Drug reference'),

-- Political hot topics (keep chat sports-focused)
('word_filter', 'inappropriate', 'trump', 'low', 'warn', 'Political figure - keep chat sports-focused'),
('word_filter', 'inappropriate', 'biden', 'low', 'warn', 'Political figure - keep chat sports-focused'),
('word_filter', 'inappropriate', 'democrat', 'low', 'warn', 'Political - keep chat sports-focused'),
('word_filter', 'inappropriate', 'republican', 'low', 'warn', 'Political - keep chat sports-focused'),
('word_filter', 'inappropriate', 'liberal', 'low', 'warn', 'Political - keep chat sports-focused'),
('word_filter', 'inappropriate', 'conservative', 'low', 'warn', 'Political - keep chat sports-focused'),
('word_filter', 'inappropriate', 'maga', 'low', 'warn', 'Political - keep chat sports-focused'),
('word_filter', 'inappropriate', 'woke', 'low', 'warn', 'Political - keep chat sports-focused'),

-- Misinformation triggers
('word_filter', 'inappropriate', 'fake news', 'low', 'warn', 'Potential misinformation'),
('word_filter', 'inappropriate', 'rigged', 'low', 'warn', 'Context-dependent'),
('word_filter', 'inappropriate', 'conspiracy', 'low', 'warn', 'Context-dependent');

-- =====================================================
-- SPORTS-SPECIFIC ALLOWED TERMS
-- Some words need context (these override blocks in sports context)
-- =====================================================

-- Note: The moderation system will use these as context hints
-- to allow sports-related usage that might otherwise be flagged

INSERT INTO chat_moderation_rules (rule_type, category, pattern, severity, action, is_active, description) VALUES
-- Words commonly used in sports context
('word_filter', 'sports_context', 'killed it', 'low', 'allow', true, 'Sports expression - positive'),
('word_filter', 'sports_context', 'murdered', 'low', 'allow', true, 'Sports expression - dominated'),
('word_filter', 'sports_context', 'destroyed', 'low', 'allow', true, 'Sports expression - won decisively'),
('word_filter', 'sports_context', 'crushed', 'low', 'allow', true, 'Sports expression - won decisively'),
('word_filter', 'sports_context', 'slaughtered', 'low', 'allow', true, 'Sports expression - won decisively'),
('word_filter', 'sports_context', 'choke', 'low', 'allow', true, 'Sports expression - failed under pressure'),
('word_filter', 'sports_context', 'choker', 'low', 'allow', true, 'Sports expression - one who chokes'),
('word_filter', 'sports_context', 'bust', 'low', 'allow', true, 'Sports expression - failed prospect'),
('word_filter', 'sports_context', 'bum', 'low', 'allow', true, 'Sports expression - bad player'),
('word_filter', 'sports_context', 'scrub', 'low', 'allow', true, 'Sports expression - poor player'),
('word_filter', 'sports_context', 'washed', 'low', 'allow', true, 'Sports expression - past prime'),
('word_filter', 'sports_context', 'cooked', 'low', 'allow', true, 'Sports expression - past prime'),
('word_filter', 'sports_context', 'exposed', 'low', 'allow', true, 'Sports expression - weakness shown'),
('word_filter', 'sports_context', 'fraud', 'low', 'allow', true, 'Sports expression - overrated'),
('word_filter', 'sports_context', 'hate', 'low', 'allow', true, 'Sports expression - dislike team'),
('word_filter', 'sports_context', 'suck', 'low', 'allow', true, 'Sports expression - team plays poorly'),
('word_filter', 'sports_context', 'sucks', 'low', 'allow', true, 'Sports expression - team plays poorly'),
('word_filter', 'sports_context', 'garbage', 'low', 'allow', true, 'Sports expression - poor performance'),
('word_filter', 'sports_context', 'trash', 'low', 'allow', true, 'Sports expression - poor performance'),
('word_filter', 'sports_context', 'clown', 'low', 'allow', true, 'Sports expression - foolish'),
('word_filter', 'sports_context', 'joke', 'low', 'allow', true, 'Sports expression - not serious'),
('word_filter', 'sports_context', 'pathetic', 'low', 'allow', true, 'Sports expression - poor performance'),
('word_filter', 'sports_context', 'embarrassing', 'low', 'allow', true, 'Sports expression - poor showing');

-- =====================================================
-- RATE LIMITING RULES
-- =====================================================

-- These are handled programmatically but stored for reference
INSERT INTO chat_moderation_rules (rule_type, category, pattern, severity, action, description) VALUES
('rate_limit', 'spam', 'messages_per_minute:10', 'medium', 'mute', 'Max 10 messages per minute'),
('rate_limit', 'spam', 'messages_per_hour:100', 'medium', 'mute', 'Max 100 messages per hour'),
('rate_limit', 'spam', 'duplicate_message_cooldown:30', 'low', 'block', 'No duplicate messages within 30 seconds'),
('rate_limit', 'spam', 'similar_message_threshold:0.8', 'low', 'warn', 'Block messages 80%+ similar to recent'),
('rate_limit', 'spam', 'new_user_cooldown:5', 'low', 'block', 'New users wait 5 seconds between messages');

-- =====================================================
-- Create indexes for efficient rule lookup
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_moderation_rules_lookup ON chat_moderation_rules(is_active, category, rule_type);
CREATE INDEX IF NOT EXISTS idx_moderation_rules_pattern ON chat_moderation_rules USING gin(pattern gin_trgm_ops) WHERE rule_type = 'word_filter';
