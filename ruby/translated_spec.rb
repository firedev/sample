module Translated
  module ClassMethods
    def find_by(attributes)
      query = self
      stringified_attributes = attributes.stringify_keys
      stringified_attributes.slice(*translated_attributes).each do |key, value|
        _, attr, _, locale = key.match(
          # title_(en|th) etc
          Regexp.new("(\\w+)(_(#{I18n.available_locales.join('|')}))$"),
        ).to_a

        query = query.where(
          "#{attr} @> hstore(:locale, :value)",
          locale: locale,
          value: value,
        )
      end
      query = query.where(stringified_attributes.without(*translated_attributes))
      query.take
    end

    def find_or_initialize_by(locale_data)
      find_by(locale_data) || new(locale_data)
    end

    def find_or_create_by(locale_data)
      find_by(locale_data) || create(locale_data)
    end

    private

    def translated_attributes
      @translated_attributes ||= translated_attribute_names.flat_map do |attr|
        I18n.available_locales.flat_map do |locale|
          "#{attr}_#{locale}"
        end
      end
    end
  end

  def translates(*args)
    extend ClassMethods
    super *args, accessors: I18n.available_locales
  end
end
