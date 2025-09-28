import React from "react";

import {
    Blockquote,
    H1,
    H2,
    H3,
    H4,
    Large,
    Lead,
    Muted,
    P,
    Small,
} from "@/components/ui/typography";

export default function Page() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <H1>Typography System</H1>

            <Lead className="mt-4">
                A comprehensive typography system using Geist Sans as the
                primary font family, following the design guidelines from
                DESIGN.md.
            </Lead>

            <div className="space-y-8 mt-8">
                <section>
                    <H2>Headings</H2>
                    <P>Typography hierarchy with Geist Sans font family.</P>

                    <div className="space-y-4 mt-4">
                        <H1>H1 Heading - Main page titles</H1>
                        <H2>H2 Heading - Section headers</H2>
                        <H3>H3 Heading - Subsection headers</H3>
                        <H4>H4 Heading - Component headers</H4>
                    </div>
                </section>

                <section>
                    <H2>Body Text</H2>
                    <P>Various body text styles for different content types.</P>

                    <div className="space-y-4 mt-4">
                        <div>
                            <H4>Paragraph</H4>
                            <P>
                                This is a standard paragraph with proper line
                                height and spacing. It uses the leading-7 class
                                for comfortable reading. The typography system
                                ensures consistent spacing between paragraphs
                                with the [&:not(:first-child)]:mt-6 utility.
                            </P>
                        </div>

                        <div>
                            <H4>Lead Text</H4>
                            <Lead>
                                This is lead text, perfect for introductions or
                                highlighted content. It uses a larger font size
                                with muted foreground color.
                            </Lead>
                        </div>

                        <div>
                            <H4>Large Text</H4>
                            <Large>
                                This is large text for emphasized content. It
                                combines larger size with semibold font weight
                                for better hierarchy.
                            </Large>
                        </div>

                        <div>
                            <H4>Small Text</H4>
                            <Small>
                                This is small text for metadata, labels, or
                                secondary information. It uses smaller font size
                                with medium weight.
                            </Small>
                        </div>

                        <div>
                            <H4>Muted Text</H4>
                            <Muted>
                                This is muted text for secondary information or
                                less important content. It uses small font size
                                with muted foreground color.
                            </Muted>
                        </div>
                    </div>
                </section>

                <section>
                    <H2>Blockquote</H2>
                    <P>Special formatting for quoted content.</P>

                    <Blockquote className="mt-4">
                        "This is a blockquote example. It provides special
                        styling for quoted text with left border and italic
                        formatting. Perfect for highlighting important
                        statements or citations."
                    </Blockquote>
                </section>

                <section>
                    <H2>Responsive Typography</H2>
                    <P>
                        The typography system includes responsive font sizing.
                        Headings automatically adjust size based on screen size
                        (e.g., H1 scales from text-4xl on mobile to text-5xl on
                        large screens).
                    </P>

                    <div className="mt-4 p-4 bg-muted rounded-lg">
                        <H4>Responsive Example</H4>
                        <P>
                            Resize your browser window to see how the H1 heading
                            above changes size. The system uses Tailwind's
                            responsive prefixes (sm:, md:, lg:, xl:) to provide
                            optimal readability across devices.
                        </P>
                    </div>
                </section>

                <section>
                    <H2>Font Families</H2>
                    <P>
                        The system utilizes both Geist Sans and Inter fonts as
                        specified in the design guidelines.
                    </P>

                    <div className="space-y-4 mt-4">
                        <div>
                            <H4 className="font-geist">Geist Sans (Primary)</H4>
                            <P className="font-geist">
                                This text uses Geist Sans, the primary font
                                family for headings and body text throughout the
                                application.
                            </P>
                        </div>

                        <div>
                            <H4 className="font-inter">Inter (Secondary)</H4>
                            <P className="font-inter">
                                This text uses Inter, which can be used for
                                specific UI elements or as an alternative font
                                family.
                            </P>
                        </div>
                    </div>
                </section>

                <section>
                    <H2>Theme Switching</H2>
                    <P>
                        The typography system supports both light and dark
                        themes. Use the theme toggle button in the top-right
                        corner of the screen to switch between themes. The
                        system automatically adapts colors and maintains proper
                        contrast ratios for accessibility.
                    </P>

                    <div className="mt-4 space-y-2">
                        <Muted>• Light theme: Clean, bright appearance</Muted>
                        <Muted>
                            • Dark theme: Easy on the eyes for low-light
                            environments
                        </Muted>
                        <Muted>
                            • System theme: Automatically matches your OS
                            preference
                        </Muted>
                        <Muted>
                            • Persistent: Your theme choice is remembered
                        </Muted>
                        <Muted>• Global access: Available on every page</Muted>
                    </div>
                </section>

                <section>
                    <H2>Accessibility</H2>
                    <P>
                        The typography system follows accessibility guidelines
                        with proper contrast ratios, minimum font sizes, and
                        semantic HTML elements.
                    </P>

                    <div className="mt-4 space-y-2">
                        <Muted>• Minimum font size: 14px (0.875rem)</Muted>
                        <Muted>• Line height: 1.5 minimum for body text</Muted>
                        <Muted>• Proper heading hierarchy maintained</Muted>
                        <Muted>• Semantic HTML elements used</Muted>
                        <Muted>• Font display: swap for optimal loading</Muted>
                        <Muted>
                            • Theme switching respects user preferences
                        </Muted>
                    </div>
                </section>
            </div>
        </div>
    );
}
