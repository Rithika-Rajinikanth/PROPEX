// src/routes/mod.rs

use axum::Router;
use std::sync::Arc;
use crate::AppState;

pub mod admin;
pub mod ai;
pub mod analytics;
pub mod auth;
pub mod health;
pub mod openapi;
pub mod regions;
pub mod search;
pub mod user;