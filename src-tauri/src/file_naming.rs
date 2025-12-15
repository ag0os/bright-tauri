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
#[allow(dead_code)]
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

/// Slugify a variation name to create a Git branch name
///
/// This is an enhanced version of slugify specifically for variation names.
/// It converts display names like "What if Sarah lived?" to branch-safe names
/// like "what-if-sarah-lived".
///
/// # Rules:
/// - Convert to lowercase
/// - Replace spaces with hyphens
/// - Remove special characters (keep only alphanumeric and hyphens)
/// - Collapse multiple consecutive hyphens into one
/// - Trim hyphens from start and end
/// - If result is empty or all-special-chars, return "untitled"
/// - Truncate to 50 characters max (for reasonable branch names)
///
/// # Arguments
/// * `name` - The variation display name
///
/// # Returns
/// A slugified branch name, or "untitled" if the input is empty or contains only special chars
#[allow(dead_code)]
pub fn slugify_variation_name(name: &str) -> String {
    // Use the existing slugify logic
    let slug = slugify(name);

    // Handle empty results
    if slug.is_empty() {
        return "untitled".to_string();
    }

    // Truncate to 50 characters for reasonable branch names
    if slug.len() > 50 {
        // Try to truncate at a hyphen boundary to avoid cutting words
        if let Some(pos) = slug[..50].rfind('-') {
            slug[..pos].to_string()
        } else {
            slug[..50].to_string()
        }
    } else {
        slug
    }
}

/// Create a unique slugified variation name by checking against existing branch names
///
/// If the slugified name already exists as a branch, appends -2, -3, etc.
/// until a unique name is found.
///
/// # Arguments
/// * `name` - The variation display name
/// * `existing_branches` - List of existing branch names
///
/// # Returns
/// A unique slugified branch name that doesn't conflict with existing branches
///
/// # Examples
/// ```
/// let branches = vec!["main".to_string(), "what-if-sarah-lived".to_string()];
/// let unique = slugify_unique_variation("What if Sarah lived?", &branches);
/// // Returns "what-if-sarah-lived-2"
/// ```
#[allow(dead_code)]
pub fn slugify_unique_variation(name: &str, existing_branches: &[String]) -> String {
    let base_slug = slugify_variation_name(name);

    // If no collision, return the base slug
    if !existing_branches.contains(&base_slug) {
        return base_slug;
    }

    // If there's a collision, append a counter
    let mut counter = 2;
    loop {
        let unique_slug = format!("{}-{}", base_slug, counter);
        if !existing_branches.contains(&unique_slug) {
            return unique_slug;
        }
        counter += 1;

        // Safety: prevent infinite loop (though unlikely with realistic data)
        if counter > 1000 {
            return format!("{}-{}", base_slug, counter);
        }
    }
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
#[allow(dead_code)]
pub fn generate_filename(order: usize, title: &str) -> String {
    let slug = slugify(title);

    // If slug is empty (e.g., title was all special chars), use default
    let slug = if slug.is_empty() {
        "untitled".to_string()
    } else {
        slug
    };

    format!("{order:03}-{slug}.md")
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
#[allow(dead_code)]
pub fn generate_unique_filename(
    order: usize,
    title: &str,
    existing_filenames: &[String],
) -> String {
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
        let filename = format!("{order:03}-{slug}-{counter}.md");
        if !existing_filenames.contains(&filename) {
            return filename;
        }
        counter += 1;

        // Safety: prevent infinite loop (though unlikely with realistic data)
        if counter > 1000 {
            return format!("{order:03}-{slug}-{counter}.md");
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
        assert_eq!(
            generate_filename(1, "First Chapter"),
            "001-first-chapter.md"
        );
    }

    #[test]
    fn test_generate_filename_double_digits() {
        assert_eq!(generate_filename(42, "The Answer"), "042-the-answer.md");
    }

    #[test]
    fn test_generate_filename_triple_digits() {
        assert_eq!(
            generate_filename(123, "Large Number"),
            "123-large-number.md"
        );
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

    // Tests for slugify_variation_name
    #[test]
    fn test_slugify_variation_name_basic() {
        assert_eq!(
            slugify_variation_name("What if Sarah lived?"),
            "what-if-sarah-lived"
        );
    }

    #[test]
    fn test_slugify_variation_name_empty() {
        assert_eq!(slugify_variation_name(""), "untitled");
    }

    #[test]
    fn test_slugify_variation_name_only_special_chars() {
        assert_eq!(slugify_variation_name("!!!@@@###"), "untitled");
    }

    #[test]
    fn test_slugify_variation_name_with_numbers() {
        // Period is removed as a special char, so "2.0" becomes "20"
        assert_eq!(
            slugify_variation_name("Version 2.0 Beta"),
            "version-20-beta"
        );
    }

    #[test]
    fn test_slugify_variation_name_unicode() {
        // Unicode should be stripped
        assert_eq!(slugify_variation_name("Café Résumé"), "caf-rsum");
    }

    #[test]
    fn test_slugify_variation_name_multiple_spaces() {
        assert_eq!(
            slugify_variation_name("Multiple   Spaces   Between"),
            "multiple-spaces-between"
        );
    }

    #[test]
    fn test_slugify_variation_name_leading_trailing_spaces() {
        assert_eq!(
            slugify_variation_name("  Trimmed  "),
            "trimmed"
        );
    }

    #[test]
    fn test_slugify_variation_name_truncation() {
        // Very long name should be truncated to 50 chars
        let long_name = "This is a very long variation name that should be truncated to fifty characters maximum";
        let result = slugify_variation_name(long_name);

        assert!(result.len() <= 50);
        assert!(result.starts_with("this-is-a-very-long-variation-name"));
    }

    #[test]
    fn test_slugify_variation_name_truncation_at_word_boundary() {
        // Should try to truncate at a hyphen if possible
        let long_name = "A very long variation name with multiple words that exceeds limit";
        let result = slugify_variation_name(long_name);

        assert!(result.len() <= 50);
        // Should not end with a partial word
        assert!(!result.ends_with('-'));
    }

    #[test]
    fn test_slugify_variation_name_exactly_50_chars() {
        // Name that becomes exactly 50 chars after slugification should not be truncated
        // Using all lowercase and hyphens to ensure no processing changes length
        let name = "abcde-12345-67890-abcde-12345-67890-abcde-12345-xy";
        let result = slugify_variation_name(name);
        assert_eq!(result.len(), 50);
        assert_eq!(result, "abcde-12345-67890-abcde-12345-67890-abcde-12345-xy");
    }

    // Tests for slugify_unique_variation
    #[test]
    fn test_slugify_unique_variation_no_conflict() {
        let branches = vec!["main".to_string(), "develop".to_string()];
        let result = slugify_unique_variation("What if Sarah lived?", &branches);
        assert_eq!(result, "what-if-sarah-lived");
    }

    #[test]
    fn test_slugify_unique_variation_with_conflict() {
        let branches = vec![
            "main".to_string(),
            "what-if-sarah-lived".to_string(),
        ];
        let result = slugify_unique_variation("What if Sarah lived?", &branches);
        assert_eq!(result, "what-if-sarah-lived-2");
    }

    #[test]
    fn test_slugify_unique_variation_multiple_conflicts() {
        let branches = vec![
            "main".to_string(),
            "alternate-ending".to_string(),
            "alternate-ending-2".to_string(),
            "alternate-ending-3".to_string(),
        ];
        let result = slugify_unique_variation("Alternate Ending", &branches);
        assert_eq!(result, "alternate-ending-4");
    }

    #[test]
    fn test_slugify_unique_variation_empty_branches() {
        let branches: Vec<String> = vec![];
        let result = slugify_unique_variation("New Variation", &branches);
        assert_eq!(result, "new-variation");
    }

    #[test]
    fn test_slugify_unique_variation_untitled() {
        let branches = vec!["untitled".to_string()];
        let result = slugify_unique_variation("!!!!", &branches);
        assert_eq!(result, "untitled-2");
    }

    #[test]
    fn test_slugify_unique_variation_similar_names() {
        // Ensure we don't match partial strings
        let branches = vec![
            "sarah".to_string(),
            "sarah-2".to_string(),
            "sarah-jones".to_string(), // This should not affect "sarah" counting
        ];
        let result = slugify_unique_variation("Sarah", &branches);
        assert_eq!(result, "sarah-3");
    }

    #[test]
    fn test_slugify_unique_variation_preserves_truncation() {
        // If base slug is truncated to 50 chars, appended numbers should still work
        let long_name = "This is a very long variation name that will be truncated to fifty characters";
        let base = slugify_variation_name(long_name);

        let branches = vec![base.clone()];
        let result = slugify_unique_variation(long_name, &branches);

        assert_eq!(result, format!("{}-2", base));
    }
}
