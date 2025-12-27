use image::{DynamicImage, GenericImageView, ImageBuffer, RgbaImage};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::Path;
use std::fs;

// Sprite font character info
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CharacterInfo {
    pub character: String,
    pub width: u32,
    pub height: u32,
    pub spacing: u32,
    pub offset_y: i32,
}

// Request to load images from directory
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoadImagesRequest {
    pub directory: String,
    pub characters: String,
}

// Response with loaded image info
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LoadImagesResponse {
    pub characters: Vec<CharacterInfo>,
    pub max_width: u32,
    pub max_height: u32,
}

// Request to generate sprite font
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GenerateSpriteFontRequest {
    pub directory: String,
    pub characters: String,
    pub spacing_config: HashMap<String, u32>,
    pub bottom_padding: u32,
    pub output_path: String,
}

// Response from sprite font generation
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GenerateSpriteFontResponse {
    pub success: bool,
    pub output_path: String,
    pub sprite_width: u32,
    pub sprite_height: u32,
    pub config_data: String,
}

// Preview request
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PreviewRequest {
    pub directory: String,
    pub characters: String,
    pub spacing_config: HashMap<String, u32>,
    pub bottom_padding: u32,
}

// Preview response with base64 encoded image
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PreviewResponse {
    pub success: bool,
    pub preview_base64: String,
    pub width: u32,
    pub height: u32,
}

#[tauri::command]
fn load_character_images(request: LoadImagesRequest) -> Result<LoadImagesResponse, String> {
    let dir = Path::new(&request.directory);
    if !dir.exists() {
        return Err("Directory does not exist".to_string());
    }

    let mut characters = Vec::new();
    let mut max_width = 0;
    let mut max_height = 0;

    for ch in request.characters.chars() {
        let filename = format!("{}.png", ch);
        let img_path = dir.join(&filename);

        if !img_path.exists() {
            return Err(format!("Image not found for character: {}", ch));
        }

        let img = image::open(&img_path)
            .map_err(|e| format!("Failed to load image for '{}': {}", ch, e))?;

        let (width, height) = img.dimensions();
        max_width = max_width.max(width);
        max_height = max_height.max(height);

        characters.push(CharacterInfo {
            character: ch.to_string(),
            width,
            height,
            spacing: width, // Default spacing is the character width
            offset_y: 0,
        });
    }

    Ok(LoadImagesResponse {
        characters,
        max_width,
        max_height,
    })
}

#[tauri::command]
fn generate_sprite_font(request: GenerateSpriteFontRequest) -> Result<GenerateSpriteFontResponse, String> {
    let dir = Path::new(&request.directory);
    if !dir.exists() {
        return Err("Directory does not exist".to_string());
    }

    // Load all character images
    let mut img_list: HashMap<char, DynamicImage> = HashMap::new();
    let mut max_height_chars = 0u32;

    for ch in request.characters.chars() {
        let filename = format!("{}.png", ch);
        let img_path = dir.join(&filename);

        if !img_path.exists() {
            return Err(format!("Image not found for character: {}", ch));
        }

        let img = image::open(&img_path)
            .map_err(|e| format!("Failed to load image for '{}': {}", ch, e))?;

        let (_, height) = img.dimensions();
        if ch.is_numeric() {
            max_height_chars = max_height_chars.max(height);
        }

        img_list.insert(ch, img);
    }

    // Calculate dimensions
    let max_width = img_list.values().map(|img| img.dimensions().0).max().unwrap_or(0);
    let max_height = max_height_chars + request.bottom_padding;
    let total_width = max_width * request.characters.len() as u32;

    // Create output image
    let mut output_img: RgbaImage = ImageBuffer::new(total_width, max_height);

    // Place each character
    for (i, ch) in request.characters.chars().enumerate() {
        if let Some(img) = img_list.get(&ch) {
            let rgba = img.to_rgba8();
            let (img_width, img_height) = rgba.dimensions();
            let start_x = i as u32 * max_width;

            // Calculate vertical position
            let start_y = if ch == ',' {
                max_height - img_height
            } else if ch == '.' {
                max_height - request.bottom_padding - img_height
            } else {
                let center_offset = (max_height_chars - img_height) / 2;
                max_height - request.bottom_padding - img_height - center_offset
            };

            // Copy pixels
            for y in 0..img_height {
                for x in 0..img_width {
                    let pixel = rgba.get_pixel(x, y);
                    output_img.put_pixel(start_x + x, start_y + y, *pixel);
                }
            }
        }
    }

    // Save the output image
    let output_path = Path::new(&request.output_path);
    if let Some(parent) = output_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create output directory: {}", e))?;
    }

    output_img.save(output_path)
        .map_err(|e| format!("Failed to save sprite font: {}", e))?;

    // Generate config data
    let mut spacing_data: HashMap<u32, Vec<char>> = HashMap::new();
    for ch in request.characters.chars() {
        let spacing = request.spacing_config.get(&ch.to_string())
            .copied()
            .unwrap_or_else(|| img_list.get(&ch).map(|img| img.dimensions().0).unwrap_or(0));

        spacing_data.entry(spacing).or_insert_with(Vec::new).push(ch);
    }

    let mut formatted_data = Vec::new();
    for (spacing, chars) in spacing_data.iter() {
        formatted_data.push(format!("[{}, \"{}\"]", spacing, chars.iter().collect::<String>()));
    }

    let config_data = format!(
        "width: {}\nheight: {}\nspace info: [{}]",
        max_width,
        max_height,
        formatted_data.join(", ")
    );

    // Save config file
    let config_path = output_path.with_file_name("config.txt");
    fs::write(&config_path, &config_data)
        .map_err(|e| format!("Failed to save config: {}", e))?;

    Ok(GenerateSpriteFontResponse {
        success: true,
        output_path: output_path.to_string_lossy().to_string(),
        sprite_width: total_width,
        sprite_height: max_height,
        config_data,
    })
}

#[tauri::command]
fn generate_preview(request: PreviewRequest) -> Result<PreviewResponse, String> {
    let dir = Path::new(&request.directory);
    if !dir.exists() {
        return Err("Directory does not exist".to_string());
    }

    // Load all character images
    let mut img_list: HashMap<char, DynamicImage> = HashMap::new();
    let mut max_height_chars = 0u32;

    for ch in request.characters.chars() {
        let filename = format!("{}.png", ch);
        let img_path = dir.join(&filename);

        if !img_path.exists() {
            continue; // Skip missing characters in preview
        }

        let img = image::open(&img_path)
            .map_err(|e| format!("Failed to load image for '{}': {}", ch, e))?;

        let (_, height) = img.dimensions();
        if ch.is_numeric() {
            max_height_chars = max_height_chars.max(height);
        }

        img_list.insert(ch, img);
    }

    if img_list.is_empty() {
        return Err("No valid character images found".to_string());
    }

    // Calculate dimensions
    let _max_width = img_list.values().map(|img| img.dimensions().0).max().unwrap_or(0);
    let max_height = max_height_chars + request.bottom_padding;

    // Calculate total width for demo (with spacing)
    let mut total_width = 0u32;
    for ch in request.characters.chars() {
        if let Some(img) = img_list.get(&ch) {
            let spacing = request.spacing_config.get(&ch.to_string())
                .copied()
                .unwrap_or_else(|| img.dimensions().0);
            total_width += spacing;
        }
    }

    // Create demo image
    let mut demo_img: RgbaImage = ImageBuffer::new(total_width, max_height);

    let mut space = 0u32;
    for ch in request.characters.chars() {
        if let Some(img) = img_list.get(&ch) {
            let rgba = img.to_rgba8();
            let (img_width, img_height) = rgba.dimensions();

            let spacing = request.spacing_config.get(&ch.to_string())
                .copied()
                .unwrap_or(img_width);

            let actual_width = spacing.min(img_width);

            // Calculate vertical position
            let start_y = if ch == ',' {
                max_height - img_height
            } else if ch == '.' {
                max_height - request.bottom_padding - img_height
            } else {
                let center_offset = (max_height_chars - img_height) / 2;
                max_height - request.bottom_padding - img_height - center_offset
            };

            // Copy pixels
            for y in 0..img_height {
                for x in 0..actual_width {
                    if space + x < total_width {
                        let pixel = rgba.get_pixel(x, y);
                        demo_img.put_pixel(space + x, start_y + y, *pixel);
                    }
                }
            }

            space += spacing;
        }
    }

    // Convert to base64
    use base64::{Engine as _, engine::general_purpose};
    let mut png_data = Vec::new();
    demo_img.write_to(&mut std::io::Cursor::new(&mut png_data), image::ImageFormat::Png)
        .map_err(|e| format!("Failed to encode preview: {}", e))?;

    let base64_data = general_purpose::STANDARD.encode(&png_data);

    Ok(PreviewResponse {
        success: true,
        preview_base64: format!("data:image/png;base64,{}", base64_data),
        width: total_width,
        height: max_height,
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            load_character_images,
            generate_sprite_font,
            generate_preview
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
