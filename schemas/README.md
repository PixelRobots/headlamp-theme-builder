# Theme JSON Schemas

These schemas document the JSON formats accepted by Headlamp Theme Builder.

- `headlamp-theme.schema.json`: one complete theme.
- `theme-library-entry.schema.json`: a library card containing one or more themes.

The app also accepts builder exports from **Save / Load**, which wrap themes in a `themes` array and may include `logoDataUrl`.

The import UI performs lightweight runtime validation for required fields, base mode, hex colours, radius, font family, and button text style. Schema files are provided for editor support and external validation tools.
