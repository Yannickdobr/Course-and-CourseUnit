import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_POSTS, getPost } from "@/data/blog";
import styles from "../page.module.css";

interface Props { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Article — EduFlex Pro" };
  return { title: `${post.title} — EduFlex Pro`, description: post.excerpt };
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <main className={styles.page}>
      <article style={{ maxWidth: 760, margin: "0 auto", padding: "2.5rem 1.5rem 4rem" }}>
        <Link href="/blog" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-muted)", textDecoration: "none", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
          <i className="ti ti-arrow-left" aria-hidden="true" /> Retour au blog
        </Link>

        <span className={styles.cardTag}>{post.tag}</span>
        <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", lineHeight: 1.15, fontWeight: 700, color: "var(--text)", margin: "0.6rem 0 0.9rem", textWrap: "balance" }}>
          {post.title}
        </h1>
        <PostMeta post={post} />

        <div
          style={{ height: 240, borderRadius: "var(--radius-lg)", margin: "1.5rem 0", display: "grid", placeItems: "center", fontSize: "4rem", background: post.bg }}
          aria-hidden="true"
        >
          {post.emoji}
        </div>

        <div style={{ fontSize: "1.02rem", lineHeight: 1.8, color: "var(--text-secondary)" }}>
          <p style={{ fontSize: "1.1rem", color: "var(--text)", fontWeight: 500, marginTop: 0 }}>{post.excerpt}</p>
          {post.body.map((para, i) => (
            <p key={i} style={{ margin: "0 0 1.1rem" }}>{para}</p>
          ))}
        </div>

        <div style={{ marginTop: "2.5rem", padding: "1.5rem", borderRadius: "var(--radius-lg)", background: "var(--primary-light)", textAlign: "center" }}>
          <p style={{ fontWeight: 600, color: "var(--text)", marginBottom: "0.75rem" }}>Envie de passer à la pratique ?</p>
          <Link href="/catalogue" className="btn-orange">Explorer le catalogue</Link>
        </div>
      </article>
    </main>
  );
}

function PostMeta({ post }: { post: { author: string; authorBg: string; date: string; read: string } }) {
  return (
    <div className={styles.meta}>
      <span className={styles.metaAvatar} style={{ background: post.authorBg }} aria-hidden="true">
        {post.author.split(" ").map((w) => w[0]).join("").slice(0, 2)}
      </span>
      {post.author}
      <span className={styles.metaDot}>·</span> {post.date}
      <span className={styles.metaDot}>·</span> {post.read}
    </div>
  );
}
