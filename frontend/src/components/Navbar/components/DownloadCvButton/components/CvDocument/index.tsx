import { Document, Font, Image, Link, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { email, profile, projects, skills, socialLinks } from '../../../../../../data/portfolio';

interface CvDocumentProps {
  /** Accent color currently selected in the app (hex). */
  accent: string;
  /** Profile photo as a PNG/JPEG data URL (react-pdf can't read WebP). */
  photo: string;
  /** Public URL of the portfolio, listed in the contact box. */
  siteUrl: string;
}

// Keep whole words on a line instead of react-pdf's default hyphenation.
Font.registerHyphenationCallback((word) => [word]);

const ink = '#1f1f24';
const muted = '#5a5a66';
const paper = '#f3f3f5';

const skillLabels: Record<string, string> = {
  'react-native': 'React Native',
  react: 'React',
  node: 'Node.js',
  nextjs: 'Next.js',
  sql: 'SQL',
  'advanced-js-patterns': 'Advanced JS patterns',
  'frontend-design-patterns': 'Frontend design patterns',
  'unit-and-integration-tests': 'Unit & integration tests',
};

function hexToRgb(hex: string): [number, number, number] {
  const value = parseInt(hex.replace('#', ''), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function luminance([r, g, b]: [number, number, number]): number {
  const [lr, lg, lb] = [r, g, b].map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

/**
 * Darkens the accent until it reaches 4.5:1 contrast on the light page, so light
 * accents (silver, lime) still work as text. Lines and fills keep the original color.
 */
function readableOnLight(hex: string): string {
  let rgb = hexToRgb(hex);
  for (let i = 0; i < 20 && 1.05 / (luminance(rgb) + 0.05) < 4.5; i++) {
    rgb = rgb.map((channel) => Math.round(channel * 0.9)) as [number, number, number];
  }
  return `#${rgb.map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}

function CvDocument({ accent, photo, siteUrl }: CvDocumentProps) {
  const accentText = readableOnLight(accent);
  const s = createStyles(accent, accentText);
  const experience = [...projects].reverse();
  const contacts = [
    { label: 'Email', value: email, url: `mailto:${email}` },
    { label: 'Portfolio', value: siteUrl.replace(/^https?:\/\//, ''), url: siteUrl },
    ...socialLinks
      .filter((link) => !link.url.startsWith('mailto:'))
      .map((link) => ({
        label: link.name,
        value: link.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''),
        url: link.url,
      })),
  ];

  return (
    <Document title={`${profile.name} · CV`} author={profile.name}>
      <Page size="A4" style={s.page}>
        <View style={s.sidebar}>
          <Image src={photo} style={s.photo} />

          <View style={s.box}>
            <Text style={s.boxTitle}>Contact</Text>
            {contacts.map((contact) => (
              <View key={contact.label} style={s.contact}>
                <Text style={s.contactLabel}>{contact.label}</Text>
                <Link src={contact.url} style={s.contactValue}>
                  {contact.value}
                </Link>
              </View>
            ))}
          </View>

          <View style={s.box}>
            <Text style={s.boxTitle}>Stack</Text>
            <View style={s.chain}>
              <View style={s.chainLine} />
              {skills.map((skill, index) => (
                <View key={skill} style={s.chainItem}>
                  {/* Fading dots echo the reference design's skill diagram. */}
                  <View style={[s.chainDot, { opacity: 1 - (index / skills.length) * 0.65 }]} />
                  <Text style={s.chainLabel}>{skillLabels[skill] ?? skill}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={s.main}>
          <Text style={s.name}>{profile.name}</Text>
          <Text style={s.role}>{profile.role}</Text>

          <Text style={s.heading}>Profile</Text>
          <Text style={s.body}>{profile.summary}</Text>

          <Text style={s.heading}>Experience</Text>
          {experience.map((project) => (
            <View key={project.name} style={s.job} wrap={false}>
              <View style={s.jobHeader}>
                <Text style={s.jobTitle}>{(project.cv?.title ?? `${project.category} developer`).toUpperCase()}</Text>
                {project.period && <Text style={s.jobPeriod}>{project.period}</Text>}
              </View>
              <Text style={s.jobCompany}>
                {project.name}
                {project.via ? ` · via ${project.via}` : ''}
              </Text>
              {(project.cv?.points ?? [project.description]).map((point) => (
                <View key={point} style={s.bullet}>
                  <Text style={s.bulletMark}>•</Text>
                  <Text style={s.bulletText}>{point}</Text>
                </View>
              ))}
            </View>
          ))}        </View>
      </Page>
    </Document>
  );
}

function createStyles(accent: string, accentText: string) {
  return StyleSheet.create({
    page: { flexDirection: 'row', fontFamily: 'Helvetica', fontSize: 10.5, color: ink, lineHeight: 1.45 },
    sidebar: { width: 190, paddingVertical: 32, paddingHorizontal: 18, gap: 20 },
    photo: { width: 154, height: 154, objectFit: 'cover' },
    box: { borderWidth: 1.2, borderColor: accent, paddingVertical: 14, paddingHorizontal: 12 },
    boxTitle: { fontSize: 13, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
    contact: { marginBottom: 9 },
    contactLabel: { fontSize: 7.5, color: accentText, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.6 },
    contactValue: { fontSize: 9.5, color: ink, textDecoration: 'none' },
    chain: { position: 'relative', gap: 12 },
    chainLine: { position: 'absolute', left: 6, top: 6, bottom: 6, width: 1.5, backgroundColor: accent, opacity: 0.4 },
    chainItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    chainDot: { width: 13, height: 13, borderRadius: 6.5, backgroundColor: accent },
    chainLabel: { fontSize: 9.5, flex: 1 },
    main: { flex: 1, backgroundColor: paper, paddingVertical: 36, paddingHorizontal: 28 },
    name: { fontSize: 32, lineHeight: 1.15, fontWeight: 'bold', color: accentText, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.5 },
    role: { fontSize: 15, lineHeight: 1.2, fontWeight: 'bold', textAlign: 'center', marginTop: 6, marginBottom: 8 },
    heading: {
      fontSize: 14,
      fontWeight: 'bold',
      textAlign: 'center',
      marginTop: 24,
      marginBottom: 12,
      paddingBottom: 5,
      borderBottomWidth: 1.2,
      borderBottomColor: accent,
    },
    body: { color: ink },
    job: { marginBottom: 16 },
    jobHeader: { flexDirection: 'row', justifyContent: 'space-between' },
    jobTitle: { color: accentText, fontSize: 10.5 },
    jobPeriod: { color: muted, fontSize: 9.5 },
    jobCompany: { fontStyle: 'italic', marginBottom: 4 },
    bullet: { flexDirection: 'row', gap: 6, paddingLeft: 6, marginBottom: 5 },
    bulletMark: { width: 6 },
    bulletText: { flex: 1 },
  });
}

export default CvDocument;
