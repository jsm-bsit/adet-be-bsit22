import type { Context } from "hono";
import pool from "../config/db";
import type { CreatePostModel, PostModel } from "../models/posts.model";
import type { ResultSetHeader } from "mysql2";

export async function getAllPosts(context: Context) {
  try {
    const [rows] = await pool.query<PostModel[]>(`SELECT * FROM posts`);
    return context.json(rows, 200);
  } catch (error) {
    console.log(error);
    return context.json({ message: 'Internal server error' }, 500);
  }
}

export async function getPostById(context: Context) {
  try { 
    const id = context.req.param('id');
    const [rows] = await pool.query<PostModel[]>(`SELECT * FROM posts WHERE post_id = ?`, [id]);
    const data = rows[0];

    if (data) {
      return context.json(data, 200);
    }

    return context.json({ message: "Post not found" }, 404);
  } catch (error) {
    console.log(error);
    return context.json({ message: 'Internal server error' }, 500);
  }
}

export async function createPost(context: Context) {
  try {
    const body: CreatePostModel = await context.req.json();

    if (!body.title || body.title === "") {
      return context.json({ message: "Title is required" }, 400);
    }
    
    const [result] = await pool.query<ResultSetHeader>
      (`INSERT INTO posts (title, description, status) VALUES (?, ?, ?)`, [body.title, body.description, body.status]);

    if (result) {
      const id = result.insertId;
      const [data] = await pool.query<PostModel[]>(`SELECT * FROM posts WHERE post_id = ?`, [id]);
      const post = data[0];
      return context.json(post, 201);
    }

    return context.json({ message: "Failed to create post" }, 400);
  } catch (error) {
    console.log(error);
    return context.json({ message: "Internal server error" }, 500);
  }
}

export async function updatePost(context: Context) {
  try {
    const id = context.req.param('id');
    const body = await context.req.json();

    const fields: string[] = [];
    const values: any[] = [];

    if (body.title !== undefined) {
      fields.push('title = ?');
      values.push(body.title);
    }
    if (body.description !== undefined) {
      fields.push('description = ?');
      values.push(body.description);
    }
    if (body.status !== undefined) {
      fields.push('status = ?');
      values.push(body.status);
    }

    if (fields.length === 0) {
      return context.json({ message: "No fields to update" }, 400);
    }

    values.push(id);
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE posts SET ${fields.join(', ')} WHERE post_id = ?`, values
    );

    if (result.affectedRows > 0) {
      const [data] = await pool.query<PostModel[]>(`SELECT * FROM posts WHERE post_id = ?`, [id]);
      const post = data[0];
      return context.json(post, 200);
    }

    return context.json({ message: "Post not found" }, 404);
  } catch (error) {
    console.log(error);
    return context.json({ message: "Internal server error" }, 500);
  }
}

export async function deletePostById(context: Context) {
  try {
    const id = context.req.param('id');
    const [result] = await pool.query<ResultSetHeader>(`DELETE FROM posts WHERE post_id = ?`, [id]);

    if (result.affectedRows > 0) {
      return context.json({ message: "Post successfully deleted" }, 200);
    }

    return context.json({ message: "Post not found" }, 404);
  } catch (error) {
    console.log(error);
    return context.json({ message: "Internal server error" }, 500);
  }
}
