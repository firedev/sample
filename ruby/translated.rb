RSpec.shared_examples :translated do
  def generate_locale_data(&block)
    Hash[
      *described_class.translated_attribute_names.flat_map do |attr|
        I18n.available_locales.flat_map do |locale|
          ["#{attr}_#{locale}", yield(attr, locale)]
        end
      end
    ]
  end

  let(:locale_data) do
    generate_locale_data do |attr, locale|
      "#{locale} #{attr} content"
    end
  end

  let(:other_locale_data) do
    generate_locale_data do |attr, locale|
      "other #{locale} #{attr} content"
    end
  end

  let!(:existing) do
    model = described_class.new(locale_data)
    model.save(validate: false)
    model
  end

  describe 'with existing data' do
    it 'finds existing record by locale_data' do
      expect(described_class.find_or_initialize_by(locale_data))
        .to eq existing
    end

    describe 'with new data' do
      subject do
        described_class.find_or_initialize_by(other_locale_data)
      end

      it 'creates new record' do
        expect(subject).to_not be_persisted
      end

      it 'fills new record with other_locale_data' do
        other_locale_data.each do |key, value|
          expect(subject.send key).to eq value
        end
      end
    end
  end
end
