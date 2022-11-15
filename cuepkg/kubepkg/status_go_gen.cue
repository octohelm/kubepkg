// DO NOT EDIT THIS FILE DIRECTLY.
// generated by go extractor.
package v1alpha1

#Status: {
	images?: [string]: string
	digests?: [...#DigestMeta]
	statuses?: #Statuses
}

#Statuses: [string]: _

// +gengo:enum
#DigestMetaType: #DigestMetaBlob | #DigestMetaManifest

#DigestMetaManifest: "manifest"
#DigestMetaBlob:     "blob"

#DigestMeta: {
	type:      #DigestMetaType
	digest:    string
	name:      string
	size:      #FileSize
	tag?:      string
	platform?: string
}

#FileSize: int64