import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import {
  Article,
  ArticleContent,
  ArticleHeader,
  ArticleHeading,
  ArticleSubtitle,
  ArticleTitle,
} from '.';

const meta = {
  title: 'UI Components / Article',
  component: Article,
  args: {
    includeContents: true,
  },
} satisfies Meta<typeof Article>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithTableOfContents: Story = {
  name: 'With Table of Contents',
  render: (args) => (
    <div className='max-w-2xl'>
      <Article {...args}>
        <ArticleHeader>
          <ArticleTitle>Example Article</ArticleTitle>
          <ArticleSubtitle>Last updated: 9 May 2026</ArticleSubtitle>
        </ArticleHeader>
        <ArticleContent>
          <ArticleHeading id='introduction'>Introduction</ArticleHeading>
          <p className='text-sm'>
            This is the introduction section. Hover over the heading above to
            see the anchor link appear to its left. Clicking either the link
            icon or the heading text will update the URL hash.
          </p>
          <ArticleHeading id='details'>Details</ArticleHeading>
          <p className='text-sm'>
            This section contains more detailed information. The table of
            contents at the top was generated automatically from the headings in
            this article — no manual configuration needed.
          </p>
          <ArticleHeading id='conclusion'>Conclusion</ArticleHeading>
          <p className='text-sm'>
            The article component is fully server-component-friendly: heading
            extraction happens via React children traversal, so no client-side
            state or effects are required.
          </p>
        </ArticleContent>
      </Article>
    </div>
  ),
};

export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Card>
      <CardHeader className='text-2xl font-medium'>Article</CardHeader>
      <CardContent>
        <p className='mb-4 text-sm'>
          A composable component family for long-form document content. Headings
          are automatically collected and surfaced in a table of contents.
        </p>
        <Table className='w-fit'>
          <TableCaption>Article sub-components</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Component</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                <code>Article</code>
              </TableCell>
              <TableCell>
                Root wrapper. Traverses children to collect headings and inject
                them into <code>ArticleContents</code>.
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <code>ArticleHeader</code>
              </TableCell>
              <TableCell>
                Header area with padding and tight vertical spacing for title
                and subtitle.
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <code>ArticleContent</code>
              </TableCell>
              <TableCell>
                Body area with padding and gap between children.
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <code>ArticleTitle</code>
              </TableCell>
              <TableCell>Document title rendered as an h2.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <code>ArticleSubtitle</code>
              </TableCell>
              <TableCell>
                Subtitle or metadata line (e.g. last updated date).
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <code>ArticleContents</code>
              </TableCell>
              <TableCell>Auto-generated table of contents.</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <code>ArticleHeading</code>
              </TableCell>
              <TableCell>
                Section heading (h3) with a hover-reveal anchor link icon to the
                left. Clicking the heading or icon updates the URL hash.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  ),
};
