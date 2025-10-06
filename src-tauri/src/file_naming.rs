/// File naming utilities for story children
///
/// This module provides functions to generate consistent, filesystem-safe
/// filenames for child stories (chapters, scenes, etc.) in Git repositories.
/// Files are named with an order prefix and slugified title: "001-chapter-name.md"

/// Slugify a string to make it filesystem and URL-safe
///
/// Converts to lowercase, replaces spaces with hyphens, removes invalid characters
///
/// # Arguments
/// * `text` - The text to slugify
///
/// # Returns
/// A slugified string safe for use in filenames
pub fn slugify(text: &str) -> String {
    text.to_lowercase()
        .trim()
        // Replace spaces and underscores with hyphens
        .replace(|c: char| c.is_whitespace() || c == '_', "-")
        // Remove any character that's not ASCII alphanumeric or hyphen
        .chars()
        .filter(|c| c.is_ascii_alphanumeric() || *c == '-')
        .collect::<String>()
        // Replace multiple consecutive hyphens with single hyphen
        .split('-')
        .filter(|s| !s.is_empty())
        .collect::<Vec<&str>>()
        .join("-")
}

/// Generate a filename for a child story
///
/// Creates a filename with format: "{order:03}-{slugified-title}.md"
/// For example: "001-first-chapter.md", "042-the-final-battle.md"
///
/// # Arguments
/// * `order` - The order/position of the story (1-based)
/// * `title` - The title of the story
///
/// # Returns
/// A formatted filename string
pub fn generate_filename(order: usize, title: &str) -> String {
    let slug = slugify(title);

    // If slug is empty (e.g., title was all special chars), use default
    let slug = if slug.is_empty() {
        "untitled".to_string()
    } else {
        slug
    };

    format!("{:03}-{}.md", order, slug)
}

/// Generate a unique filename by appending a counter if needed
///
/// If the generated filename already exists in the provided list,
/// appends a counter: "001-chapter-2.md", "001-chapter-3.md", etc.
///
/// # Arguments
/// * `order` - The order/position of the story (1-based)
/// * `title` - The title of the story
/// * `existing_filenames` - List of filenames that already exist
///
/// # Returns
/// A unique filename that doesn't exist in the provided list
pub fn generate_unique_filename(order: usize, title: &str, existing_filenames: &[String]) -> String {
    let base_filename = generate_filename(order, title);

    // If no collision, return the base filename
    if !existing_filenames.contains(&base_filename) {
        return base_filename;
    }

    // If there's a collision, append a counter
    let slug = slugify(title);
    let slug = if slug.is_empty() {
        "untitled".to_string()
    } else {
        slug
    };

    let mut counter = 2;
    loop {
        let filename = format!("{:03}-{}-{}.md", order, slug, counter);
        if !existing_filenames.contains(&filename) {
            return filename;
        }
        counter += 1;

        // Safety: prevent infinite loop (though unlikely with realistic data)
        if counter > 1000 {
            return format!("{:03}-{}-{}.md", order, slug, counter);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_slugify_basic() {
        assert_eq!(slugify("Hello World"), "hello-world");
    }

    #[test]
    fn test_slugify_with_special_chars() {
        assert_eq!(slugify("The Knight's Tale!"), "the-knights-tale");
    }

    #[test]
    fn test_slugify_with_numbers() {
        assert_eq!(slugify("Chapter 42: The Answer"), "chapter-42-the-answer");
    }

    #[test]
    fn test_slugify_with_multiple_spaces() {
        assert_eq!(slugify("Multiple   Spaces   Here"), "multiple-spaces-here");
    }

    #[test]
    fn test_slugify_with_underscores() {
        assert_eq!(slugify("snake_case_title"), "snake-case-title");
    }

    #[test]
    fn test_slugify_with_unicode() {
        // Unicode characters should be removed (only ASCII alphanumeric kept)
        assert_eq!(slugify("Café résumé"), "caf-rsum");
    }

    #[test]
    fn test_slugify_empty_string() {
        assert_eq!(slugify(""), "");
    }

    #[test]
    fn test_slugify_only_special_chars() {
        assert_eq!(slugify("!!!@@@###"), "");
    }

    #[test]
    fn test_generate_filename_basic() {
        assert_eq!(generate_filename(1, "First Chapter"), "001-first-chapter.md");
    }

    #[test]
    fn test_generate_filename_double_digits() {
        assert_eq!(generate_filename(42, "The Answer"), "042-the-answer.md");
    }

    #[test]
    fn test_generate_filename_triple_digits() {
        assert_eq!(generate_filename(123, "Large Number"), "123-large-number.md");
    }

    #[test]
    fn test_generate_filename_with_special_chars() {
        assert_eq!(
            generate_filename(5, "The Knight's Quest!"),
            "005-the-knights-quest.md"
        );
    }

    #[test]
    fn test_generate_filename_empty_title() {
        assert_eq!(generate_filename(1, ""), "001-untitled.md");
    }

    #[test]
    fn test_generate_filename_only_special_chars() {
        assert_eq!(generate_filename(1, "!@#$%"), "001-untitled.md");
    }

    #[test]
    fn test_generate_unique_filename_no_collision() {
        let existing = vec![];
        let filename = generate_unique_filename(1, "First Chapter", &existing);
        assert_eq!(filename, "001-first-chapter.md");
    }

    #[test]
    fn test_generate_unique_filename_with_collision() {
        let existing = vec!["001-first-chapter.md".to_string()];
        let filename = generate_unique_filename(1, "First Chapter", &existing);
        assert_eq!(filename, "001-first-chapter-2.md");
    }

    #[test]
    fn test_generate_unique_filename_multiple_collisions() {
        let existing = vec![
            "001-chapter.md".to_string(),
            "001-chapter-2.md".to_string(),
            "001-chapter-3.md".to_string(),
        ];
        let filename = generate_unique_filename(1, "Chapter", &existing);
        assert_eq!(filename, "001-chapter-4.md");
    }

    #[test]
    fn test_generate_unique_filename_different_orders() {
        // Same title, different orders - no collision
        let existing = vec!["001-chapter.md".to_string()];
        let filename = generate_unique_filename(2, "Chapter", &existing);
        assert_eq!(filename, "002-chapter.md");
    }

    #[test]
    fn test_filename_format_consistency() {
        // Verify that generate_unique_filename returns the same format
        // as generate_filename when there's no collision
        let title = "Test Chapter";
        let order = 5;
        let existing = vec![];

        let unique = generate_unique_filename(order, title, &existing);
        let base = generate_filename(order, title);

        assert_eq!(unique, base);
    }
}
