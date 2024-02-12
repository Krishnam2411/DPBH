import torch
import core.helper as helper
from transformers import AutoTokenizer


model_name = 'bert-base-cased'
device = 'mps' if torch.backends.mps.is_available() else 'cpu'
tokenizer = AutoTokenizer.from_pretrained(model_name, model_max_length=512)

from transformers import AutoConfig

id2label = {
    0: 'Not Dark Pattern',
    1: 'Urgency',
    2: 'Scarcity',
    3: 'Misdirection',
    4: 'Social Proof',
    5: 'Obstruction',
    6: 'Sneaking',
    7: 'Forced Action'
}

label2id = { v:k for (k,v) in id2label.items()}

bert_config = AutoConfig.from_pretrained(model_name,
                                         num_labels=8,
                                         id2label=id2label, label2id=label2id)

# bert_model = BertForSequenceClassification.from_pretrained("path_to_your_saved_model_directory", config=bert_config)
bert_model = (helper.BertForClassification
              .from_pretrained(model_name,
                               config=bert_config)
              .to(device))
state_dict = torch.load('/Users/kris/Desktop/DarkBuster/backend/model/new_bert_model1.pth', map_location = device)
new_state_dcit = {k.replace('module.', '') : v for k,v in state_dict.items()}
bert_model.load_state_dict(new_state_dcit)
# Assuming you have initialized bert_model and tokenizer already
def preprocess_batch(texts, tokenizer, max_len):
    # Preprocess a batch of texts
    encodings = tokenizer.batch_encode_plus(
        texts,
        max_length=max_len,
        add_special_tokens=True,
        pad_to_max_length=True,
        return_attention_mask=True,
        return_tensors="pt",
        truncation=True
    )
    return encodings

def predict_batch(texts, bert_model, tokenizer, max_len, device):
    # Preprocess the batch
    encoding = preprocess_batch(texts, tokenizer, max_len)
    input_ids = encoding["input_ids"].to(device)
    attention_mask = encoding["attention_mask"].to(device)

    # Run inference
    with torch.inference_mode():
        output = bert_model(input_ids, attention_mask)
        _, preds = torch.max(output.logits, dim=1)
    preds = preds.cpu()
    return preds.tolist()

def batch_predict_samples(sample_texts, bert_model, tokenizer, max_len, device, batch_size=32):
    # Batch prediction for a list of sample_texts
    all_predictions = []
    for i in range(0, len(sample_texts), batch_size):
        batch_texts = sample_texts[i:i+batch_size]
        predictions = predict_batch(batch_texts, bert_model, tokenizer, max_len, device)
        all_predictions.extend(predictions)
    return all_predictions


## controller for /api/predict
def returner(sample_texts):
    original_texts = sample_texts.copy()
    results = []
    for i, t in enumerate(sample_texts):
        sample_texts[i] = helper.preprocessText(t)
    max_len = 128
    # Call batch prediction function
    predictions = batch_predict_samples(sample_texts, bert_model, tokenizer, max_len, device)
    # Assuming you have class_names defined somewhere
    class_names = ['Not Dark Pattern','Urgency','Scarcity','Confirm shaming','Social Proof','Obstruction','Sneaking', 'Forced action']
    class_predictions = [class_names[pred] for pred in predictions]
    print(class_predictions)
    for original_text, prediction in zip(original_texts, class_predictions):
        results.append({"pattern": original_text ,"response": prediction})
    return results