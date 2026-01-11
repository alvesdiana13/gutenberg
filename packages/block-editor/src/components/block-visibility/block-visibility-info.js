/**
 * WordPress dependencies
 */
import {
	Icon,
	__experimentalText as Text,
	__experimentalHStack as HStack,
	privateApis as componentsPrivateApis,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __, sprintf } from '@wordpress/i18n';
import { unseen } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import { unlock } from '../../lock-unlock';
import { store as blockEditorStore } from '../../store';
import { useBlockVisibility } from './use-block-visibility';
import { deviceTypeKey } from '../../store/private-keys';
import { BLOCK_VISIBILITY_VIEWPORTS } from './constants';
import './styles.scss';

const { Badge } = unlock( componentsPrivateApis );

export default function BlockVisibilityInfo( { clientId } ) {
	const { blockVisibility, selectedDeviceType, hasParentHiddenEverywhere } =
		useSelect(
			( select ) => {
				if ( ! clientId ) {
					return {
						blockVisibility: undefined,
						deviceType: 'desktop',
					};
				}
				const {
					getBlockParents,
					getBlockAttributes,
					isBlockHiddenEverywhere,
					getSettings,
				} = unlock( select( blockEditorStore ) );

				const attributes = getBlockAttributes( clientId );
				const currentBlockVisibility =
					attributes?.metadata?.blockVisibility;
				const parents = getBlockParents( clientId );
				const settings = getSettings();
				const currentDeviceType =
					settings?.[ deviceTypeKey ]?.toLowerCase() || 'desktop';

				return {
					blockVisibility: currentBlockVisibility,
					selectedDeviceType: currentDeviceType,
					hasParentHiddenEverywhere: parents.some( ( parentId ) =>
						isBlockHiddenEverywhere( parentId )
					),
				};
			},
			[ clientId ]
		);

	// Use hook to get current viewport and if block is currently hidden (accurate viewport detection)
	const { isBlockCurrentlyHidden, currentViewport } = useBlockVisibility( {
		blockVisibility,
		deviceType: selectedDeviceType,
	} );

	// Use selector to check if any parent (immediate or further up the chain) is hidden at current viewport
	// Also get parent visibility info to determine if parent is hidden everywhere
	const { isBlockParentHiddenAtViewport } = useSelect(
		( select ) => {
			if ( ! clientId || ! currentViewport ) {
				return {
					hasHiddenParent: false,
					parentBlockVisibility: undefined,
				};
			}
			const {
				isBlockParentHiddenAtViewport: _isBlockParentHiddenAtViewport,
			} = unlock( select( blockEditorStore ) );

			return {
				isBlockParentHiddenAtViewport: _isBlockParentHiddenAtViewport(
					clientId,
					currentViewport
				),
			};
		},
		[ clientId, currentViewport ]
	);

	if (
		! (
			isBlockCurrentlyHidden ||
			hasParentHiddenEverywhere ||
			isBlockParentHiddenAtViewport
		)
	) {
		return null;
	}

	// Determine label based on whether block or parent is hidden
	let label;
	if ( isBlockCurrentlyHidden ) {
		// Block is currently hidden - check if hidden everywhere or at specific viewport
		if ( blockVisibility === false ) {
			label = __( 'Block is hidden' );
		} else {
			const viewportLabel =
				BLOCK_VISIBILITY_VIEWPORTS[ currentViewport ]?.label ||
				currentViewport;
			label = sprintf(
				/* translators: %s: viewport name (Desktop, Tablet, Mobile) */
				__( 'Block is hidden in %s' ),
				viewportLabel
			);
		}
	}

	// Parent is hidden - check if hidden everywhere or at specific viewport
	if ( hasParentHiddenEverywhere ) {
		label = __( 'Parent block is hidden' );
	} else if ( isBlockParentHiddenAtViewport ) {
		const viewportLabel =
			BLOCK_VISIBILITY_VIEWPORTS[ currentViewport ]?.label ||
			currentViewport;
		label = sprintf(
			/* translators: %s: viewport name (Desktop, Tablet, Mobile) */
			__( 'Parent block is hidden in %s' ),
			viewportLabel
		);
	}

	return (
		<Badge className="block-editor-block-visibility-info">
			<HStack spacing={ 2 } justify="start">
				<Icon icon={ unseen } />
				<Text>{ label }</Text>
			</HStack>
		</Badge>
	);
}
