import React from "react";
import { GetServerSideProps } from "next";
import { useSession, getSession } from "next-auth/react";
import Layout from '../components/Layout';
import Post, { PostProps } from '../components/Post';
import prisma from '../lib/prisma';
import { type } from "os";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
    const session = await getSession({ req });
    if(!session) {
        res.statusCode = 403;
        return { props: { drafts: [] } };
    }

    const sessionUserData = await prisma.user.findUnique({
        where: { email: String(session.user.email) },
        select: {
            id: true,
        }

    });

    const allDrafts = await prisma.post.findMany({
        where: {
            published: false, 
        },
        include: {
            author: {
                select: { name: true },
            },
        },
    });

    const drafts = [].concat(allDrafts).filter(post => post.authorId === sessionUserData.id)

    return {
        props: { drafts },
    };
};

type Props = {
    drafts: PostProps[];
};

const Drafts: React.FC<Props> = (props) => {
    console.log(props);
    const { data: session } = useSession();

    if(!session) {
        return (
            <Layout>
                <h1>My Drafts</h1>
                <div>You need to be authenticated to view this page.</div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="page">
                <h1>My Drafts</h1>
                <main>
                    {props.drafts.map((post) => (
                        <div key={post.id} className="post">
                            <Post post={post} />
                        </div>
                    ))}
                </main>
            </div>
            <style jsx>{`
                .post {
                    background: var(--geist-background);
                    transition: box-shadow 0.1s ease-in;
                }

                .post:hover {
                    box-shadow: 1px 1px 3px #aaa;
                }

                .post + .post {
                    margin-top: 2rem;
                }
            `}</style>
        </Layout>
    );
};

export default Drafts;