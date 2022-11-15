package kubeutil

import "strings"

type LabelsAccessor interface {
	GetLabels() map[string]string
	SetLabels(labels map[string]string)
}

func Label(o LabelsAccessor, key string, value string) {
	labels := o.GetLabels()
	if labels == nil {
		labels = map[string]string{}
	}
	if value != "" {
		labels[key] = value
	} else {
		delete(labels, key)
	}
	o.SetLabels(labels)
}

func GetLabel(o LabelsAccessor, key string) string {
	labels := o.GetLabels()
	if labels != nil {
		if a, ok := labels[key]; ok {
			return a
		}
	}
	return ""
}

type AnnotationsAccessor interface {
	GetAnnotations() map[string]string
	SetAnnotations(annotations map[string]string)
}

func Annotate(o AnnotationsAccessor, key string, value string) {
	annotations := o.GetAnnotations()
	if annotations == nil {
		annotations = map[string]string{}
	}
	if value != "" {
		annotations[key] = value
	} else {
		delete(annotations, key)
	}
	o.SetAnnotations(annotations)
}

func AppendAnnotate(o AnnotationsAccessor, key string, value string) {
	annotations := o.GetAnnotations()
	if annotations == nil {
		annotations = map[string]string{}
	}
	if value != "" {
		if current, ok := annotations[key]; ok {
			annotations[key] = strings.Join(Union(strings.Split(current, ","), strings.Split(value, ",")), ",")
		} else {
			annotations[key] = value
		}
	} else {
		delete(annotations, key)
	}
	o.SetAnnotations(annotations)
}

func GetAnnotate(o AnnotationsAccessor, key string) string {
	annotations := o.GetAnnotations()
	if annotations != nil {
		if a, ok := annotations[key]; ok {
			return a
		}
	}
	return ""
}
